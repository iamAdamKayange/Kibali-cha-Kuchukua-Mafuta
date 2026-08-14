'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Bell,
  FileText,
  Home,
  PlusCircle,
  Settings,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { roleToDashboard, useAuth } from '@/contexts/AuthContext'

const rolePrimaryAction: Record<string, { href: string; label: string; icon: LucideIcon }> = {
  ADMIN: { href: '/dashboard/admin/register', label: 'Sajili', icon: UserPlus },
  DRIVER: { href: '/requests/new', label: 'Omba', icon: PlusCircle },
  MWOMBAJI: { href: '/requests/new', label: 'Omba', icon: PlusCircle },
  HEAD_OF_DEPARTMENT: { href: '/dashboard/mkuu-idara/pending', label: 'Kagua', icon: FileText },
  TRANSPORT_OFFICER: { href: '/dashboard/afisa-usafirishaji/pending', label: 'Kagua', icon: FileText },
  ADA_DAHRM: { href: '/dashboard/ada-dahrm/pending', label: 'Kagua', icon: FileText },
  PROCUREMENT: { href: '/dashboard/ununuzi-ugavi/pending', label: 'Toa', icon: FileText },
}

function getItems(role?: string) {
  const normalizedRole = role?.toUpperCase() || 'DRIVER'
  const dashboardHref = roleToDashboard(normalizedRole)
  const primary = rolePrimaryAction[normalizedRole] || rolePrimaryAction.DRIVER

  return [
    { href: dashboardHref, label: 'Mwanzo', icon: Home },
    primary,
    normalizedRole === 'ADMIN'
      ? { href: '/dashboard/admin/users', label: 'Watu', icon: Users }
      : { href: dashboardHref.includes('/mwombaji') ? '/dashboard/mwombaji/requests' : `${dashboardHref}/all`, label: 'Maombi', icon: FileText },
    { href: '/notifications', label: 'Arifa', icon: Bell },
    { href: '/settings', label: 'Zaidi', icon: Settings },
  ]
}

export function AppExperience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  const isProtectedRoute = Boolean(
    pathname &&
      (pathname.startsWith('/dashboard') ||
        pathname.startsWith('/requests') ||
        pathname.startsWith('/notifications') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/settings'))
  )

  useEffect(() => {
    if (!loading && isProtectedRoute && !user) {
      router.replace('/login')
    }
  }, [isProtectedRoute, loading, router, user])

  const showBottomNav = Boolean(isProtectedRoute && user && !pathname?.startsWith('/login'))
  const items = getItems(user?.role)
  const showSkeleton = isProtectedRoute && (loading || !user)

  return (
    <>
      {/*
        IMPORTANT: this used to be an AnimatePresence + motion.div keyed by
        pathname. That pattern can leave a client-side navigation's new page
        stuck at opacity:0 (a white screen) if framer-motion's exit/enter
        tracking gets interrupted mid-transition - which is exactly the bug
        that was reported. A plain CSS keyframe fade (below, in globals.css)
        cannot get "stuck" like that: it always runs to completion and ends
        at opacity 1, and content is never hidden behind animation state.
      */}
      <div key={pathname} className={`app-page-fade ${showBottomNav ? 'pb-24 lg:pb-0' : ''}`}>
        {showSkeleton ? <AppRouteSkeleton /> : children}
      </div>

      {showBottomNav && (
        <nav className="fixed inset-x-3 bottom-3 z-50 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="grid grid-cols-5 items-center rounded-2xl border border-white/70 bg-white/[0.94] px-2 py-2 shadow-2xl shadow-gray-900/15 backdrop-blur-2xl dark:border-gray-800/80 dark:bg-gray-950/90">
            {items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/settings' && pathname?.startsWith(`${item.href}/`))
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold text-gray-500 transition-colors dark:text-gray-400"
                >
                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-active"
                      className="absolute inset-1 rounded-xl bg-primary-500 shadow-lg shadow-primary-500/30"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon className={`relative h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-300'}`} />
                  <span className={`relative leading-none ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </>
  )
}

function AppRouteSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-16 animate-pulse rounded-xl bg-white dark:bg-gray-900" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-xl bg-white dark:bg-gray-900" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-xl bg-white dark:bg-gray-900" />
          ))}
        </div>
      </div>
    </div>
  )
}
