'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { LayoutDashboard, FileText, PlusCircle, Users, Settings, LogOut, Clock, ListChecks, Fuel, UserPlus, BarChart3, type LucideIcon } from 'lucide-react'

const navItems: Record<string, Array<{ icon: LucideIcon; labelKey: string; href: string }>> = {
  admin: [
    { icon: LayoutDashboard, labelKey: 'dashboard', href: '/dashboard/admin' },
    { icon: UserPlus, labelKey: 'registerUsers', href: '/dashboard/admin/register' },
    { icon: Users, labelKey: 'allUsers', href: '/dashboard/admin/users' },
    { icon: BarChart3, labelKey: 'reports', href: '/dashboard/admin/reports' },
  ],
  mwombaji: [
    { icon: LayoutDashboard, labelKey: 'dashboard', href: '/dashboard/mwombaji' },
    { icon: PlusCircle, labelKey: 'requestFuel', href: '/requests/new' },
    { icon: FileText, labelKey: 'myRequests', href: '/dashboard/mwombaji/requests' },
    { icon: Fuel, labelKey: 'fuelHistory', href: '/dashboard/mwombaji/history' },
  ],
  'mkuu-idara': [
    { icon: LayoutDashboard, labelKey: 'dashboard', href: '/dashboard/mkuu-idara' },
    { icon: ListChecks, labelKey: 'reviewRequests', href: '/dashboard/mkuu-idara/pending' },
    { icon: FileText, labelKey: 'allRequests', href: '/dashboard/mkuu-idara/all' },
    { icon: Clock, labelKey: 'history', href: '/dashboard/mkuu-idara/history' },
  ],
  'afisa-usafirishaji': [
    { icon: LayoutDashboard, labelKey: 'dashboard', href: '/dashboard/afisa-usafirishaji' },
    { icon: ListChecks, labelKey: 'reviewRequests', href: '/dashboard/afisa-usafirishaji/pending' },
    { icon: FileText, labelKey: 'allRequests', href: '/dashboard/afisa-usafirishaji/all' },
    { icon: Clock, labelKey: 'history', href: '/dashboard/afisa-usafirishaji/history' },
  ],
  'ada-dahrm': [
    { icon: LayoutDashboard, labelKey: 'dashboard', href: '/dashboard/ada-dahrm' },
    { icon: ListChecks, labelKey: 'reviewRequests', href: '/dashboard/ada-dahrm/pending' },
    { icon: FileText, labelKey: 'allRequests', href: '/dashboard/ada-dahrm/all' },
    { icon: Clock, labelKey: 'history', href: '/dashboard/ada-dahrm/history' },
  ],
  'ununuzi-ugavi': [
    { icon: LayoutDashboard, labelKey: 'dashboard', href: '/dashboard/ununuzi-ugavi' },
    { icon: ListChecks, labelKey: 'reviewRequests', href: '/dashboard/ununuzi-ugavi/pending' },
    { icon: FileText, labelKey: 'allRequests', href: '/dashboard/ununuzi-ugavi/all' },
    { icon: Clock, labelKey: 'history', href: '/dashboard/ununuzi-ugavi/history' },
  ],
}

function roleLabel(role: string) {
  switch (role) {
    case 'admin':
      return 'Msimamizi'
    case 'mwombaji':
      return 'Mwombaji/Dereva'
    case 'mkuu-idara':
      return 'Mkuu wa Idara'
    case 'afisa-usafirishaji':
      return 'Afisa Usafirishaji'
    case 'ada-dahrm':
      return 'ADA'
    case 'ununuzi-ugavi':
      return 'Ununuzi na Ugavi'
    default:
      return role.replace('-', ' ').toUpperCase()
  }
}

interface SidebarProps {
  role: keyof typeof navItems
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { logout } = useAuth()
  const items = navItems[role] || navItems.mwombaji

  return (
    <>
      {/* Desktop keeps the full navigation; phones use the bottom app menu. */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 hidden h-full w-[280px] bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-50 flex-col lg:relative lg:flex lg:translate-x-0"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Fuel className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Kibali Mafuta
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {roleLabel(role)}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : ''}`} />
                <span className="text-sm font-medium">{t(item.labelKey)}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="ml-auto w-1.5 h-6 bg-primary-500 rounded-full"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">{t('settings')}</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">{t('logout')}</span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}
