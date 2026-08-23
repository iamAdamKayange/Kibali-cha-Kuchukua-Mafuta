import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Decode Base64Url string in Next.js Edge Runtime
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  try {
    return atob(base64)
  } catch (e) {
    console.error('Failed to decode base64url token part:', e)
    return ''
  }
}

// Extract role payload from JWT token
function getRoleFromToken(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payloadJson = base64UrlDecode(parts[1])
    if (!payloadJson) return null
    const payload = JSON.parse(payloadJson)
    return String(payload.role || '').toUpperCase()
  } catch (error) {
    console.warn('Failed to parse JWT payload role:', error)
    return null
  }
}

const roleDashboardMap: Record<string, string> = {
  ADMIN: '/dashboard/admin',
  DRIVER: '/dashboard/mwombaji',
  MWOMBAJI: '/dashboard/mwombaji',
  HEAD_OF_DEPARTMENT: '/dashboard/mkuu-idara',
  TRANSPORT_OFFICER: '/dashboard/afisa-usafirishaji',
  ADA_DAHRM: '/dashboard/ada-dahrm',
  PROCUREMENT: '/dashboard/ununuzi-ugavi',
}

const routeRoleMap = [
  { prefix: '/dashboard/admin', role: 'ADMIN' },
  { prefix: '/dashboard/mwombaji', role: 'DRIVER' },
  { prefix: '/dashboard/mkuu-idara', role: 'HEAD_OF_DEPARTMENT' },
  { prefix: '/dashboard/afisa-usafirishaji', role: 'TRANSPORT_OFFICER' },
  { prefix: '/dashboard/ada-dahrm', role: 'ADA_DAHRM' },
  { prefix: '/dashboard/ununuzi-ugavi', role: 'PROCUREMENT' },
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const tokenCookie = request.cookies.get('token')
  const token = tokenCookie?.value

  const isProtectedRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/requests') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/settings')

  const isLoginRoute = pathname.startsWith('/login')
  const isLandingPage = pathname === '/'

  // 1. Not logged in -> Redirect protected routes to login
  if (!token) {
    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url)
      // Save original URL to redirect back after login if desired
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // 2. Logged in -> Verify role and path authorization
  const userRole = getRoleFromToken(token)
  
  if (!userRole) {
    // Corrupt token -> Clear token cookie and redirect to login
    if (isProtectedRoute) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      response.cookies.delete('refreshToken')
      return response
    }
    return NextResponse.next()
  }

  // If user is logged in and tries to access /login or landing page, redirect to their dashboard
  if (isLoginRoute || isLandingPage) {
    const target = roleDashboardMap[userRole] || '/dashboard/mwombaji'
    return NextResponse.redirect(new URL(target, request.url))
  }

  // Verify dashboard subfolder matches user role
  if (pathname.startsWith('/dashboard')) {
    for (const route of routeRoleMap) {
      if (pathname.startsWith(route.prefix)) {
        const isAllowed = 
          route.role === 'DRIVER'
            ? (userRole === 'DRIVER' || userRole === 'MWOMBAJI')
            : (userRole === route.role)

        if (!isAllowed) {
          console.warn(`Middleware redirecting unauthorized path request: ${pathname} for role ${userRole}`)
          const target = roleDashboardMap[userRole] || '/dashboard/mwombaji'
          return NextResponse.redirect(new URL(target, request.url))
        }
      }
    }
  }

  return NextResponse.next()
}

// Only match dashboard, requests, notifications, profile, settings and login routes
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/requests/:path*',
    '/notifications/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/login',
  ],
}
