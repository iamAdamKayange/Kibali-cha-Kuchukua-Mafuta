'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/common/Header'
import { Sidebar } from '@/components/common/Sidebar'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { LanguageToggle } from '@/components/i18n/LanguageToggle'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { getUserDisplayName, roleToDashboard, useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import { ArrowLeft, Bell, Languages, Moon, User } from 'lucide-react'

function roleToSidebarRole(role?: string) {
  const normalized = String(role || '').toUpperCase()
  if (normalized === 'ADMIN') return 'admin'
  if (normalized === 'HEAD_OF_DEPARTMENT') return 'mkuu-idara'
  if (normalized === 'TRANSPORT_OFFICER') return 'afisa-usafirishaji'
  if (normalized === 'ADA_DAHRM') return 'ada-dahrm'
  if (normalized === 'PROCUREMENT') return 'ununuzi-ugavi'
  return 'mwombaji'
}

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('notifications-enabled')
    if (stored) setNotificationsEnabled(stored === 'true')
  }, [])

  const setNotifications = (value: boolean) => {
    setNotificationsEnabled(value)
    localStorage.setItem('notifications-enabled', String(value))
  }

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar role={roleToSidebarRole(user.role) as any} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={{ name: getUserDisplayName(user), role: user.role }} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex items-center gap-4">
              <Link href={roleToDashboard(user.role)} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings_title')}</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">{t('settings_subtitle')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-primary-500" />
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">{t('theme')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('theme_desc')}</p>
                  </div>
                </div>
                <ThemeToggle />
              </div>

              <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-primary-500" />
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">{t('language')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('language_desc')}</p>
                  </div>
                </div>
                <LanguageToggle />
              </div>

              <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary-500" />
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">{t('notifications')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings_notifications_desc')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications(!notificationsEnabled)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${notificationsEnabled ? 'bg-success-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}`}
                >
                  {notificationsEnabled ? 'On' : 'Off'}
                </button>
              </div>

              <Link href="/profile" className="glass-card rounded-2xl p-5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-900/70">
                <User className="h-5 w-5 text-primary-500" />
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{t('profile')}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile_desc')}</p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
