'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, User, ChevronDown, Search, X, Settings, LogOut, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from '@/components/i18n/LanguageToggle'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

interface HeaderProps {
  toggleSidebar: () => void
  user?: {
    name: string
    role: string
    avatar?: string
  }
}

interface HeaderNotification {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  requestId?: string
}

export function Header({ toggleSidebar, user }: HeaderProps) {
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [inlineNotifications, setInlineNotifications] = useState<HeaderNotification[]>([])
  const { language, t } = useLanguage()
  const { logout, user: authUser } = useAuth()
  const knownNotificationIds = useRef<Set<string>>(new Set())
  const initializedNotifications = useRef(false)
  const dismissTimers = useRef<Record<string, number>>({})

  const [notifications, setNotifications] = useState<HeaderNotification[]>([])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const dismissInlineNotification = (id: string) => {
    setInlineNotifications((items) => items.filter((item) => item.id !== id))

    const timer = dismissTimers.current[id]
    if (timer) {
      window.clearTimeout(timer)
      delete dismissTimers.current[id]
    }
  }

  const playNotificationSound = () => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('notifications-enabled') === 'false') return

    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!AudioContextClass) return

    try {
      const context = new AudioContextClass()
      void context.resume?.()

      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = 880
      gain.gain.value = 0.0001

      oscillator.connect(gain)
      gain.connect(context.destination)

      const now = context.currentTime
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)

      oscillator.start(now)
      oscillator.stop(now + 0.38)
      oscillator.onended = () => {
        void context.close()
      }
    } catch {
      // Ignore browsers that block autoplay or audio creation.
    }
  }

  const showInlineNotification = (notification: HeaderNotification) => {
    if (localStorage.getItem('notifications-enabled') === 'false') return

    setInlineNotifications((current) => {
      if (current.some((item) => item.id === notification.id)) {
        return current
      }

      return [notification, ...current].slice(0, 3)
    })

    playNotificationSound()

    if (dismissTimers.current[notification.id]) {
      window.clearTimeout(dismissTimers.current[notification.id])
    }

    dismissTimers.current[notification.id] = window.setTimeout(() => {
      dismissInlineNotification(notification.id)
    }, 6500)
  }

  const showDeviceNotification = (notification: HeaderNotification) => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('notifications-enabled') === 'false') return
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      tag: notification.id,
    })

    browserNotification.onclick = () => {
      window.focus()
      if (notification.requestId) {
        router.push(`/requests/${notification.requestId}`)
      } else {
        router.push('/notifications')
      }
      browserNotification.close()
    }
  }

  const fetchNotifications = async () => {
    if (!authUser) return

    const response = await api.get<HeaderNotification[]>('/notifications?limit=8')

    if (!response.success || !response.data) return

    const incoming = response.data
    const nextIds = new Set(incoming.map((item) => item.id))

    if (initializedNotifications.current) {
      incoming
        .filter((item) => !item.isRead && !knownNotificationIds.current.has(item.id))
        .forEach((item) => {
          showDeviceNotification(item)
          showInlineNotification(item)
        })
    }

    knownNotificationIds.current = nextIds
    initializedNotifications.current = true
    setNotifications(incoming)
  }

  useEffect(() => {
    if (!authUser) return

    fetchNotifications()
    const intervalId = window.setInterval(fetchNotifications, 30000)

    return () => window.clearInterval(intervalId)
  }, [authUser?.id])

  useEffect(() => {
    return () => {
      Object.values(dismissTimers.current).forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const deleteNotification = async (id: string) => {
    const response = await api.delete(`/notifications/${id}`)
    if (response.success) {
      setNotifications((items) => items.filter((item) => item.id !== id))
      knownNotificationIds.current.delete(id)
    }
  }

  const openNotification = async (notification: HeaderNotification) => {
    if (!notification.isRead) {
      await api.patch(`/notifications/${notification.id}/read`, {})
      setNotifications((items) =>
        items.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item
        )
      )
    }

    setShowNotifications(false)

    if (notification.requestId) {
      router.push(`/requests/${notification.requestId}`)
    }
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
              onClick={async () => {
                if (
                  typeof window !== 'undefined' &&
                  'Notification' in window &&
                  Notification.permission === 'default' &&
                  localStorage.getItem('notifications-enabled') !== 'false'
                ) {
                  await Notification.requestPermission()
                }

                setShowNotifications(!showNotifications)
                fetchNotifications()
              }}
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
                    {notifications.length > 0 ? notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        drag="x"
                        dragConstraints={{ left: -96, right: 0 }}
                        dragElastic={0.08}
                        onDragEnd={(_, info) => {
                          if (info.offset.x < -72) deleteNotification(notif.id)
                        }}
                        onClick={() => openNotification(notif)}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors duration-200 border-b border-gray-100 dark:border-gray-800 ${
                          !notif.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${
                            !notif.isRead ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">{notif.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{notif.message}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {new Date(notif.createdAt).toLocaleString(language === 'sw' ? 'sw-TZ' : 'en-US')}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              deleteNotification(notif.id)
                            }}
                            className="rounded-lg p-1.5 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Hakuna arifa mpya.
                      </div>
                    )}
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatRoleLabel(user?.role)}</p>
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

      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(100vw-2rem,24rem)] flex-col gap-3" aria-live="polite">
        <AnimatePresence initial={false}>
          {inlineNotifications.map((notification) => (
            <motion.button
              key={notification.id}
              initial={{ opacity: 0, x: 24, y: -8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 24, y: -8 }}
              onClick={() => openNotification(notification)}
              className="pointer-events-auto rounded-2xl border border-primary-200 bg-white p-4 text-left shadow-2xl shadow-gray-900/20 dark:border-primary-900/40 dark:bg-gray-950"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{notification.title}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-300">{notification.message}</p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    dismissInlineNotification(notification.id)
                  }}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  aria-label="Close notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </header>
  )
}

function formatRoleLabel(role?: string) {
  const normalized = String(role || '').trim().toUpperCase()

  switch (normalized) {
    case 'ADMIN':
      return 'Msimamizi'
    case 'DRIVER':
    case 'MWOMBAJI':
      return 'Mwombaji/Dereva'
    case 'HEAD_OF_DEPARTMENT':
      return 'Mkuu wa Idara'
    case 'TRANSPORT_OFFICER':
      return 'Afisa Usafirishaji'
    case 'ADA_DAHRM':
      return 'ADA'
    case 'PROCUREMENT':
      return 'Ununuzi na Ugavi'
    default:
      return role || 'Mwombaji'
  }
}
