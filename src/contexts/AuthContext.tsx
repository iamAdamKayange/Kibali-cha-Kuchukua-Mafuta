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
import { getCookie, setCookie, deleteCookie } from '@/lib/cookies'
import {
  registerDevicePushToken,
  unregisterDevicePushToken,
  canReceivePushNotifications,
} from '@/lib/pushNotifications'

export interface User {
  id: string
  name?: string
  firstName?: string
  lastName?: string
  title?: string | null
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

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null

    const accessToken = getCookie('token') || localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!accessToken || !storedUser) return null

    try {
      const parsedUser = JSON.parse(storedUser) as User
      return parsedUser?.id ? parsedUser : null
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true
    return Boolean(getCookie('token') || localStorage.getItem('token'))
  })

  /**
   * RESTORE SESSION
   *
   * Runs once when the application starts.
   *
   * We first load the cached user so the UI can immediately
   * know who is logged in, then verify the access token
   * against the backend.
   */
  const restoreSession = useCallback(async () => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const accessToken = getCookie('token') || localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      /**
       * No token = no authenticated session.
       */
      if (!accessToken) {
        setUser(null)
        setLoading(false)
        return
      }

      /**
       * Set token immediately.
       */
      api.setToken(accessToken)

      /**
       * Restore cached user immediately.
       *
       * This prevents unnecessary blank/loading states
       * when refreshing the dashboard.
       */
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User

          if (parsedUser && parsedUser.id) {
            setUser(parsedUser)
          }
        } catch (error) {
          console.error(
            'Failed to parse stored user:',
            error
          )

          localStorage.removeItem('user')
        }
      }

      /**
       * Verify access token with backend.
       */
      const response = await api.get<User>('/auth/me')

      if (response.success && response.data) {
        /**
         * Backend confirmed the session.
         */
        setUser(response.data)

        localStorage.setItem(
          'user',
          JSON.stringify(response.data)
        )
      } else {
        /**
         * Token is invalid or expired.
         */
        clearStoredSession()
        setUser(null)
      }
    } catch (error) {
      console.error(
        'Failed to restore authentication session:',
        error
      )

      /**
       * IMPORTANT:
       *
       * If backend is temporarily unavailable but we have
       * a cached user, don't immediately log the user out.
       */
      const storedUser = localStorage.getItem('user')

      if (!storedUser) {
        clearStoredSession()
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * INITIAL SESSION RESTORE
   */
  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  /**
   * PUSH TOKEN SYNC
   *
   * Keep the current device registered with FCM whenever
   * the authenticated user changes.
   */
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (loading) {
      return
    }

    if (!user?.id) {
      void unregisterDevicePushToken()
      return
    }

    if (!canReceivePushNotifications(user.role)) {
      void unregisterDevicePushToken()
      return
    }

    void registerDevicePushToken(user.role)
  }, [loading, user?.id, user?.role])

  /**
   * LOGIN
   */
  const login = async (
    email: string,
    password: string
  ): Promise<void> => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const response = await api.post<LoginResponse>(
        '/auth/login',
        {
          email: email.trim(),
          password,
        }
      )

      /**
       * Validate backend response.
       */
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
       * Validate tokens.
       */
      if (!accessToken) {
        throw new Error(
          'Login succeeded but access token was not returned.'
        )
      }

      if (!loggedInUser) {
        throw new Error(
          'Login succeeded but user information was not returned.'
        )
      }

      /**
       * ------------------------------------------------
       * SAVE AUTHENTICATION DATA
       * ------------------------------------------------
       *
       * Save token BEFORE navigation.
       */
      localStorage.setItem(
        'token',
        accessToken
      )
      setCookie('token', accessToken, 7)

      if (refreshToken) {
        localStorage.setItem(
          'refreshToken',
          refreshToken
        )
        setCookie('refreshToken', refreshToken, 30)
      }

      localStorage.setItem(
        'user',
        JSON.stringify(loggedInUser)
      )

      /**
       * Update API client immediately.
       */
      api.setToken(accessToken)

      /**
       * Update React authentication state BEFORE
       * navigating to dashboard.
       */
      setUser(loggedInUser)

      /**
       * Determine dashboard according to role.
       */
      const dashboard = roleToDashboard(
        loggedInUser.role
      )

      console.log(
        'Login successful:',
        loggedInUser.email
      )

      console.log(
        'User role:',
        loggedInUser.role
      )

      console.log(
        'Redirecting to:',
        dashboard
      )

      /**
       * Navigate using replace.
       *
       * DO NOT call router.refresh() here.
       *
       * The AuthContext state has already been updated,
       * so refresh is unnecessary and can cause an
       * unwanted rendering transition.
       */
      router.replace(dashboard)
    } catch (error) {
      console.error(
        'Login failed:',
        error
      )

      throw error
    }
  }

  /**
   * LOGOUT
   */
  const logout = async (): Promise<void> => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      await unregisterDevicePushToken()

      const refreshToken =
        localStorage.getItem('refreshToken')

      /**
       * Tell backend about logout if refresh token exists.
       *
       * Backend failure should NOT prevent local logout.
       */
      if (refreshToken) {
        try {
          await api.post(
            '/auth/logout',
            {
              refreshToken,
            }
          )
        } catch (error) {
          console.warn(
            'Backend logout failed. Continuing local logout.',
            error
          )
        }
      }
    } finally {
      /**
       * Clear authentication completely.
       */
      clearStoredSession()
      setUser(null)

      /**
       * Return to login.
       */
      router.replace('/login')
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

function clearStoredSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    deleteCookie('token')
    deleteCookie('refreshToken')
  }

  api.clearToken()
}




/**
 * ------------------------------------------------
 * useAuth
 * ------------------------------------------------
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
 * ------------------------------------------------
 * GET USER DISPLAY NAME
 * ------------------------------------------------
 */
export const getUserDisplayName = (
  user: User | null
) => {
  if (!user) {
    return ''
  }

  return (
    user.name ||
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ') ||
    user.email
  )
}

/**
 * ------------------------------------------------
 * GET USER DEPARTMENT NAME
 * ------------------------------------------------
 */
export const getUserDepartmentName = (
  user: User | null
) => {
  if (!user?.department) {
    return ''
  }

  if (typeof user.department === 'string') {
    return user.department
  }

  return user.department.name
}

/**
 * ------------------------------------------------
 * ROLE → DASHBOARD
 * ------------------------------------------------
 */
export const roleToDashboard = (
  role: string
) => {
  const normalized = String(
    role || ''
  )
    .trim()
    .toUpperCase()

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
      console.warn(
        `Unknown user role "${role}". Redirecting to mwombaji dashboard.`
      )

      return '/dashboard/mwombaji'
  }
}
