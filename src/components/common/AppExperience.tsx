'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  FileText,
  Home,
  PlusCircle,
  Settings,
  UserPlus,
  Users,
} from 'lucide-react'
import { roleToDashboard, useAuth } from '@/contexts/AuthContext'

const rolePrimaryAction: Record<string, { href: string; label: string; icon: any }> = {
  ADMIN: { href: '/dashboard/admin/register', label: 'Sajili', icon: UserPlus },
  DRIVER: { href: '/requests/new', label: 'Omba', icon: PlusCircle },
  HEAD_OF_DEPARTMENT: { href: '/dashboard/mkuu-idara/pending', label: 'Kagua', icon: FileText },
  TRANSPORT_OFFICER: { href: '/dashboard/afisa-usafirishaji/pending', label: 'Kagua', icon: FileText },
  ADA_DAHRM: { href: '/dashboard/ada-dahrm/pending', label: 'Kagua', icon: FileText },
  PROCUREMENT: { href: '/dashboard/ununuzi-ugavi/pending', label: 'Kagua', icon: FileText },
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
  const { user } = useAuth()
  const showBottomNav = Boolean(
    pathname &&
      !pathname.startsWith('/login') &&
      (pathname.startsWith('/dashboard') ||
        pathname.startsWith('/requests') ||
        pathname.startsWith('/notifications') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/settings'))
  )
  const items = getItems(user?.role)

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={showBottomNav ? 'pb-24 lg:pb-0' : undefined}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {showBottomNav && (
        <nav className="fixed inset-x-3 bottom-3 z-50 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="grid grid-cols-5 items-center rounded-[1.75rem] border border-white/70 bg-white/[0.92] px-2 py-2 shadow-2xl shadow-gray-900/15 backdrop-blur-2xl dark:border-gray-800/80 dark:bg-gray-950/90">
            {items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/settings' && pathname?.startsWith(`${item.href}/`))
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold text-gray-500 transition-colors dark:text-gray-400"
                >
                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-active"
                      className="absolute inset-1 rounded-2xl bg-primary-500 shadow-lg shadow-primary-500/30"
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
