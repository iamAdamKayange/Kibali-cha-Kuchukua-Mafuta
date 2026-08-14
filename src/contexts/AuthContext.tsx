'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface User {
  id: string
  name?: string
  firstName?: string
  lastName?: string
  employeeNumber?: string
  email: string
  role: string
  department?: string | { id: string; name: string }
  departmentId?: string
  phone?: string
}

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
)

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * Restore authentication session on page load
   */
  const restoreSession = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      // No access token means user is not authenticated
      if (!accessToken) {
        setUser(null)
        return
      }

      // Set token immediately so API requests can use it
      api.setToken(accessToken)

      /**
       * If we already have a cached user, show it immediately.
       * This prevents the white-screen/loading delay.
       */
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User
          setUser(parsedUser)
        } catch {
          localStorage.removeItem('user')
        }
      }

      /**
       * Verify token with backend
       */
      const response = await api.get<User>('/auth/me')

      if (response.success && response.data) {
        setUser(response.data)

        localStorage.setItem(
          'user',
          JSON.stringify(response.data)
        )
      } else {
        // Invalid/expired token
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')

        api.clearToken()

        setUser(null)
      }
    } catch (error) {
      console.error('Failed to restore authentication session:', error)

      /**
       * Do not immediately destroy the session if the API
       * temporarily fails.
       *
       * If we have cached user data, keep it.
       */
      const storedUser = localStorage.getItem('user')

      if (!storedUser) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        api.clearToken()
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Restore session when application starts
   */
  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  /**
   * LOGIN
   */
  const login = async (
    email: string,
    password: string
  ): Promise<void> => {
    setLoading(true)

    try {
      const response = await api.post<LoginResponse>(
        '/auth/login',
        {
          email,
          password,
        }
      )

      if (!response.success || !response.data) {
        throw new Error(
          response.error || 'Login failed'
        )
      }

      const {
        accessToken,
        refreshToken,
        user: loggedInUser,
      } = response.data

      /**
       * IMPORTANT:
       * Save accessToken as "token" because the rest of
       * the application expects localStorage.getItem('token')
       */
      localStorage.setItem('token', accessToken)

      localStorage.setItem(
        'refreshToken',
        refreshToken
      )

      localStorage.setItem(
        'user',
        JSON.stringify(loggedInUser)
      )

      /**
       * Set API authorization immediately
       */
      api.setToken(accessToken)

      /**
       * Update React state BEFORE navigation.
       * This prevents dashboard components from rendering
       * while user is still null.
       */
      setUser(loggedInUser)

      /**
       * Determine dashboard based on role
       */
      const dashboard = roleToDashboard(
        loggedInUser.role
      )

      /**
       * Use replace instead of push so login page
       * is not kept in browser history.
       */
      router.replace(dashboard)

      /**
       * Refresh router state so Next.js immediately
       * picks up the authenticated state.
       */
      router.refresh()
    } catch (error) {
      console.error('Login failed:', error)

      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * LOGOUT
   */
  const logout = async (): Promise<void> => {
    try {
      const refreshToken =
        localStorage.getItem('refreshToken')

      /**
       * Call backend logout if available.
       * We don't let a backend failure prevent local logout.
       */
      if (refreshToken) {
        try {
          await api.post('/auth/logout', {
            refreshToken,
          })
        } catch (error) {
          console.warn(
            'Backend logout failed, continuing local logout:',
            error
          )
        }
      }
    } finally {
      /**
       * Always clear local authentication
       */
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')

      api.clearToken()

      setUser(null)

      router.replace('/login')
      router.refresh()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    )
  }

  return context
}

/**
 * Get user's display name
 */
export const getUserDisplayName = (
  user: User | null
) => {
  if (!user) return ''

  return (
    user.name ||
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ') ||
    user.email
  )
}

/**
 * Get department name
 */
export const getUserDepartmentName = (
  user: User | null
) => {
  if (!user?.department) return ''

  return typeof user.department === 'string'
    ? user.department
    : user.department.name
}

/**
 * Convert role to dashboard
 */
export const roleToDashboard = (
  role: string
) => {
  const normalized = String(role || '').toUpperCase()

  switch (normalized) {
    case 'ADMIN':
      return '/dashboard/admin'

    case 'DRIVER':
    case 'MWOMBAJI':
      return '/dashboard/mwombaji'

    case 'HEAD_OF_DEPARTMENT':
      return '/dashboard/mkuu-idara'

    case 'TRANSPORT_OFFICER':
      return '/dashboard/afisa-usafirishaji'

    case 'ADA_DAHRM':
      return '/dashboard/ada-dahrm'

    case 'PROCUREMENT':
      return '/dashboard/ununuzi-ugavi'

    default:
      return '/dashboard/mwombaji'
  }
}