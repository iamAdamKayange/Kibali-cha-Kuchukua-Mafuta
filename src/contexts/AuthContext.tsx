'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
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
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.setToken(token)
      api.get<User>('/auth/me').then((response) => {
        if (response.success && response.data) {
          setUser(response.data)
          localStorage.setItem('user', JSON.stringify(response.data))
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }).finally(() => setLoading(false))
      return
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await api.post<{
        accessToken: string
        refreshToken: string
        user: User
      }>('/auth/login', { email, password })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed')
      }
      
      api.setToken(response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setUser(response.data.user)
      router.push(roleToDashboard(response.data.user.role))
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    api.clearToken()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const getUserDisplayName = (user: User | null) => {
  if (!user) return ''
  return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
}

export const getUserDepartmentName = (user: User | null) => {
  if (!user?.department) return ''
  return typeof user.department === 'string' ? user.department : user.department.name
}

export const roleToDashboard = (role: string) => {
  const normalized = role.toUpperCase()
  if (normalized === 'ADMIN') return '/dashboard/admin'
  if (normalized === 'DRIVER' || normalized === 'MWOMBAJI') return '/dashboard/mwombaji'
  if (normalized === 'HEAD_OF_DEPARTMENT') return '/dashboard/mkuu-idara'
  if (normalized === 'TRANSPORT_OFFICER') return '/dashboard/afisa-usafirishaji'
  if (normalized === 'ADA_DAHRM') return '/dashboard/ada-dahrm'
  if (normalized === 'PROCUREMENT') return '/dashboard/ununuzi-ugavi'
  return '/dashboard/mwombaji'
}
