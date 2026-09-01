import { getCookie, setCookie, deleteCookie } from '@/lib/cookies'

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  'https://fuel-request-backend.onrender.com/api'
).replace(/\/+$/, '')

const REQUEST_TIMEOUT_MS = 20000

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
   * Get current token
   */
  getToken(): string | null {
    return this.token
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null
    this.csrfToken = null
    this.csrfSecret = null

    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('csrfToken')
      localStorage.removeItem('csrfSecret')
      deleteCookie('token')
    }
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
       */
      if (response.status === 401) {
        return {
          success: false,
          error: errorFromPayload(data, 'Session expired'),
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
            ? 'Imeshindikana kuunganisha na server. Hakikisha backend ya Render ipo online na CORS/URL zimewekwa sahihi.'
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
