'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, User, ChevronDown, Search, X, Settings, LogOut, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from '@/components/i18n/LanguageToggle'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  toggleSidebar: () => void
  user?: {
    name: string
    role: string
    avatar?: string
  }
}

export function Header({ toggleSidebar, user }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { language, t } = useLanguage()
  const { logout } = useAuth()

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Ombi #FR-00241 limewasilishwa', time: 'Dakika 5 zilizopita', read: false },
    { id: 2, title: 'Idhini ya Mkuu wa Idara imekamilika', time: 'Saa 2 zilizopita', read: false },
    { id: 3, title: 'Ombi #FR-00239 limekataliwa', time: 'Saa 5 zilizopita', read: true },
    { id: 4, title: 'Mafuta yametolewa kwa ombi #FR-00238', time: 'Saa 8 zilizopita', read: true },
  ])

  const unreadCount = notifications.filter(n => !n.read).length
  const deleteLocalNotification = (id: number) => {
    setNotifications((items) => items.filter((item) => item.id !== id))
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="hidden"
            aria-label="Toggle sidebar"
          >
          </button>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
              {new Date().toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {/* Center - Search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none text-sm"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageToggle />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-950" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('notifications')}</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        drag="x"
                        dragConstraints={{ left: -96, right: 0 }}
                        dragElastic={0.08}
                        onDragEnd={(_, info) => {
                          if (info.offset.x < -72) deleteLocalNotification(notif.id)
                        }}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors duration-200 border-b border-gray-100 dark:border-gray-800 ${
                          !notif.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${
                            !notif.read ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">{notif.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              deleteLocalNotification(notif.id)
                            }}
                            className="rounded-lg p-1.5 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-gray-800 text-center">
                    <Link href="/notifications" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                      {t('viewAllNotifications')}
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Profile"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <p className="font-medium text-gray-900 dark:text-white">{user?.name || 'Adam'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role || 'Mwombaji'}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-200"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">{t('profile')}</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-200"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">{t('settings')}</span>
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">{t('logout')}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
