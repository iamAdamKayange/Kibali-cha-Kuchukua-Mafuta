import { getCookie, setCookie, deleteCookie } from '@/lib/cookies'

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : 'https://fuel-request-backend-production.up.railway.app/api')
).replace(/\/+$/, '')

const REQUEST_TIMEOUT_MS = 60000

interface PaginationMeta {
  total?: number
  totalPages?: number
  page?: number
  limit?: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: PaginationMeta
}

function objectValue(data: unknown, key: string): unknown {
  if (typeof data !== 'object' || data === null) return undefined
  return (data as Record<string, unknown>)[key]
}

function errorFromPayload(data: unknown, fallback: string) {
  const value =
    objectValue(data, 'message') ||
    objectValue(data, 'error') ||
    objectValue(data, 'detail')

  return typeof value === 'string' && value.trim() ? value : fallback
}

export class ApiClient {
  private static instance: ApiClient
  private token: string | null = null
  private csrfToken: string | null = null
  private csrfSecret: string | null = null
  private refreshPromise: Promise<void> | null = null // Track ongoing refresh
  private authInvalidatedCallback: (() => void) | null = null // Callback for auth invalidation

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = getCookie('token') || localStorage.getItem('token')
      this.csrfToken = localStorage.getItem('csrfToken')
      this.csrfSecret = localStorage.getItem('csrfSecret')
    }
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }

    return ApiClient.instance
  }

  /**
   * Set authentication token
   */
  setToken(token: string) {
    this.token = token

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
      setCookie('token', token, 7)
    }
  }

  /**
   * Set CSRF token
   */
  setCSRFToken(token: string, secret?: string) {
    this.csrfToken = token
    if (secret) {
      this.csrfSecret = secret
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('csrfToken', token)
      if (secret) {
        localStorage.setItem('csrfSecret', secret)
      }
    }
  }

  /**
   * Register callback for auth invalidation
   */
  registerAuthInvalidatedCallback(callback: () => void): void {
    this.authInvalidatedCallback = callback
  }

  /**
   * Trigger auth invalidation callback
   */
  private notifyAuthInvalidated() {
    if (this.authInvalidatedCallback) {
      try {
        this.authInvalidatedCallback()
      } catch (error) {
        console.error('[API] Error in auth invalidation callback:', error)
      }
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token
  }

  /**
   * Get refresh token from storage
   */
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refreshToken') || null
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    console.log('[API] Attempting to refresh access token')

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Refresh token failed')
    }

    const data = await response.json()
    if (!data.success || !data.data?.accessToken) {
      throw new Error('Refresh token response invalid')
    }

    const { accessToken, refreshToken: newRefreshToken } = data.data

    // Update tokens
    this.token = accessToken
    localStorage.setItem('token', accessToken)
    setCookie('token', accessToken, 7)

    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken)
      setCookie('refreshToken', newRefreshToken, 30)
    }

    console.log('[API] Access token refreshed successfully')
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null
    this.csrfToken = null
    this.csrfSecret = null
    this.refreshPromise = null // Clear refresh promise

    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('csrfToken')
      localStorage.removeItem('csrfSecret')
      deleteCookie('token')
      deleteCookie('refreshToken')
    }
  }

  /**
   * Clear authentication and notify AuthContext
   */
  clearAuthentication() {
    this.clearToken()
    this.notifyAuthInvalidated()
  }

  /**
   * Main API request handler
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    /*
     * Check internet connection
     */
    if (
      typeof navigator !== 'undefined' &&
      !navigator.onLine
    ) {
      return {
        success: false,
        error:
          'Hakuna muunganisho wa intaneti. Tafadhali jaribu tena mtandao utakaporudi.',
      }
    }

    /*
     * Make sure endpoint starts with /
     */
    const normalizedEndpoint = endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`

    const url = `${API_URL}${normalizedEndpoint}`

    /*
     * Prepare headers
     */
    const headers = new Headers(options.headers)

    headers.set('Content-Type', 'application/json')

    /*
     * Add Authorization header when token exists
     */
    if (this.token) {
      headers.set(
        'Authorization',
        `Bearer ${this.token}`
      )
    }

    /*
     * Add CSRF token for state-changing requests
     */
    if (
      this.csrfToken &&
      this.csrfSecret &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
        (options.method || 'GET').toUpperCase()
      )
    ) {
      headers.set('X-CSRF-Token', this.csrfToken)
      headers.set('X-CSRF-Secret', this.csrfSecret)
    }

    const controller =
      options.signal ? null : new AbortController()

    const timeoutId: ReturnType<typeof setTimeout> | null = controller
      ? setTimeout(
          () => controller.abort(),
          REQUEST_TIMEOUT_MS
        )
      : null

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: options.signal || controller?.signal,
      })

      /*
       * Capture CSRF token from response header
       */
      const csrfTokenFromResponse = response.headers.get('X-CSRF-Token')
      const csrfSecretFromResponse = response.headers.get('X-CSRF-Secret')
      if (csrfTokenFromResponse) {
        this.setCSRFToken(csrfTokenFromResponse, csrfSecretFromResponse || undefined)
      }

      /*
       * Handle empty responses
       */
      const contentType =
        response.headers.get('content-type') || ''

      let data: unknown = null

      if (contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch {
          data = null
        }
      } else {
        try {
          data = await response.text()
        } catch {
          data = null
        }
      }

      /*
       * Handle unauthorized request
       *
       * IMPORTANT:
       * Do not automatically redirect here.
       * AuthContext should control logout/navigation.
       * 
       * Instead, attempt to refresh the access token.
       */
      if (response.status === 401) {
        console.log('[API] Received 401, attempting token refresh')

        // If a refresh is already in progress, wait for it
        if (this.refreshPromise) {
          await this.refreshPromise
          // Retry the original request with new token
          const retryHeaders = new Headers(options.headers)
          retryHeaders.set('Content-Type', 'application/json')
          if (this.token) {
            retryHeaders.set('Authorization', `Bearer ${this.token}`)
          }
          
          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
            signal: options.signal || controller?.signal,
          })
          
          // Capture CSRF token from retry response
          const csrfTokenFromRetry = retryResponse.headers.get('X-CSRF-Token')
          const csrfSecretFromRetry = retryResponse.headers.get('X-CSRF-Secret')
          if (csrfTokenFromRetry) {
            this.setCSRFToken(csrfTokenFromRetry, csrfSecretFromRetry || undefined)
          }
          
          // Process retry response
          const retryContentType = retryResponse.headers.get('content-type') || ''
          let retryData: unknown = null
          
          if (retryContentType.includes('application/json')) {
            try {
              retryData = await retryResponse.json()
            } catch {
              retryData = null
            }
          } else {
            try {
              retryData = await retryResponse.text()
            } catch {
              retryData = null
            }
          }
          
          if (retryResponse.ok) {
            if (typeof retryData === 'object' && retryData !== null && 'success' in retryData) {
              return retryData as ApiResponse<T>
            }
            return {
              success: true,
              data: retryData as T,
            }
          } else {
            return {
              success: false,
              error: errorFromPayload(retryData, 'Request failed after refresh'),
            }
          }
        }

        // Start a new refresh operation
        this.refreshPromise = this.refreshAccessToken()
          .then(() => {
            console.log('[API] Refresh completed successfully')
            this.refreshPromise = null
          })
          .catch((error) => {
            console.error('[API] Refresh failed:', error)
            this.refreshPromise = null
            // Clear session and notify AuthContext on refresh failure
            this.clearAuthentication()
            // Force redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
            throw error
          })

        await this.refreshPromise

        // Retry the original request with new token
        const retryHeaders = new Headers(options.headers)
        retryHeaders.set('Content-Type', 'application/json')
        if (this.token) {
          retryHeaders.set('Authorization', `Bearer ${this.token}`)
        }
        
        const retryResponse = await fetch(url, {
          ...options,
          headers: retryHeaders,
          signal: options.signal || controller?.signal,
        })
        
        // Capture CSRF token from retry response
        const csrfTokenFromRetry = retryResponse.headers.get('X-CSRF-Token')
        const csrfSecretFromRetry = retryResponse.headers.get('X-CSRF-Secret')
        if (csrfTokenFromRetry) {
          this.setCSRFToken(csrfTokenFromRetry, csrfSecretFromRetry || undefined)
        }
        
        // Process retry response
        const retryContentType = retryResponse.headers.get('content-type') || ''
        let retryData: unknown = null
        
        if (retryContentType.includes('application/json')) {
          try {
            retryData = await retryResponse.json()
          } catch {
            retryData = null
          }
        } else {
          try {
            retryData = await retryResponse.text()
          } catch {
            retryData = null
          }
        }
        
        if (retryResponse.ok) {
          if (typeof retryData === 'object' && retryData !== null && 'success' in retryData) {
            return retryData as ApiResponse<T>
          }
          return {
            success: true,
            data: retryData as T,
          }
        } else {
          return {
            success: false,
            error: errorFromPayload(retryData, 'Request failed after refresh'),
          }
        }
      }

      /*
       * Handle other HTTP errors
       */
      if (!response.ok) {
        let errorMessage =
          'Request failed'

        if (typeof data === 'object' && data !== null) {
          errorMessage = errorFromPayload(data, errorMessage)
        } else if (
          typeof data === 'string' &&
          data.trim()
        ) {
          errorMessage = data
        }

        return {
          success: false,
          error: errorMessage,
        }
      }

      /*
       * Backend already returned standard API response:
       *
       * {
       *   success: true,
       *   data: ...
       * }
       */
      if (
        typeof data === 'object' &&
        data !== null &&
        'success' in data
      ) {
        return data as ApiResponse<T>
      }

      /*
       * Backend returned raw data
       */
      return {
        success: true,
        data: data as T,
      }
    } catch (error: unknown) {
      console.error(
        `API request failed: ${url}`,
        error
      )

      const message =
        error instanceof Error &&
        error.name === 'AbortError'
          ? 'Server imechelewa kujibu. Tafadhali jaribu tena baada ya muda mfupi.'
          : error instanceof TypeError
            ? 'Imeshindikana kuunganisha na server. Hakikisha backend ipo online na CORS/URL zimewekwa sahihi.'
            : error instanceof Error
              ? error.message
              : 'Network error'

      return {
        success: false,
        error: message,
      }
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }

  /**
   * GET
   */
  async get<T>(
    endpoint: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    })
  }

  /**
   * POST
   */
  async post<T>(
    endpoint: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    })
  }

  /**
   * PUT
   */
  async put<T>(
    endpoint: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    })
  }

  /**
   * PATCH
   */
  async patch<T>(
    endpoint: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    })
  }

  /**
   * DELETE
   */
  async delete<T>(
    endpoint: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    })
  }

  /**
   * Document Generation Methods
   */
  async checkPrintPermission(requestId: string): Promise<ApiResponse<{ canPrint: boolean }>> {
    return this.get<{ canPrint: boolean }>(`/documents/${requestId}/can-print`)
  }

  async generateFuelPermit(requestId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/documents/${requestId}/permit`)
  }

  async generateFuelStatement(requestId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/documents/${requestId}/statement`)
  }

  /**
   * Export Methods
   */
  async exportFuelRequestsPDF(filters?: Record<string, string>): Promise<Blob> {
    const queryString = filters ? `?${new URLSearchParams(filters).toString()}` : ''
    const url = `${API_URL}/api/exports/fuel-requests/pdf${queryString}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to export PDF')
    }

    return response.blob()
  }

  async exportFuelRequestsExcel(filters?: Record<string, string>): Promise<Blob> {
    const queryString = filters ? `?${new URLSearchParams(filters).toString()}` : ''
    const url = `${API_URL}/api/exports/fuel-requests/excel${queryString}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to export Excel')
    }

    return response.blob()
  }

  async exportAuditLogsPDF(filters?: Record<string, string>): Promise<Blob> {
    const queryString = filters ? `?${new URLSearchParams(filters).toString()}` : ''
    const url = `${API_URL}/api/exports/audit-logs/pdf${queryString}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to export PDF')
    }

    return response.blob()
  }

  async exportAuditLogsExcel(filters?: Record<string, string>): Promise<Blob> {
    const queryString = filters ? `?${new URLSearchParams(filters).toString()}` : ''
    const url = `${API_URL}/api/exports/audit-logs/excel${queryString}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to export Excel')
    }

    return response.blob()
  }

  /**
   * Analytics Methods
   */
  async getSystemStats(): Promise<ApiResponse<any>> {
    return this.get<any>('/api/analytics/system-stats')
  }

  async getFuelConsumptionByMonth(year?: number): Promise<ApiResponse<any>> {
    const queryString = year ? `?year=${year}` : ''
    return this.get<any>(`/api/analytics/fuel-consumption${queryString}`)
  }

  async getRequestsByDepartment(): Promise<ApiResponse<any>> {
    return this.get<any>('/api/analytics/departments')
  }

  async getRequestsByStatus(): Promise<ApiResponse<any>> {
    return this.get<any>('/api/analytics/status')
  }

  async getApprovalStatsByApprover(): Promise<ApiResponse<any>> {
    return this.get<any>('/api/analytics/approvers')
  }

  async getRecentActivity(limit?: number): Promise<ApiResponse<any>> {
    const queryString = limit ? `?limit=${limit}` : ''
    return this.get<any>(`/api/analytics/recent-activity${queryString}`)
  }

  async getDashboardSummary(): Promise<ApiResponse<any>> {
    return this.get<any>('/api/analytics/dashboard')
  }
}

export const api = ApiClient.getInstance()
