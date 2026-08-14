const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://fuel-request-backend.onrender.com/api'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export class ApiClient {
  private static instance: ApiClient
  private token: string | null = null

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
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

    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
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

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      /*
       * Handle empty responses
       */
      const contentType =
        response.headers.get('content-type') || ''

      let data: any = null

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
          error:
            typeof data === 'object' &&
            data !== null
              ? String(
                  data.message ||
                    data.error ||
                    'Session expired'
                )
              : 'Session expired',
        }
      }

      /*
       * Handle other HTTP errors
       */
      if (!response.ok) {
        let errorMessage =
          'Request failed'

        if (
          typeof data === 'object' &&
          data !== null
        ) {
          errorMessage =
            String(
              data.message ||
                data.error ||
                data.detail ||
                errorMessage
            )
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

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Network error',
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
    body?: any
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
    body?: any
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
    body?: any
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
    endpoint: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

export const api = ApiClient.getInstance()