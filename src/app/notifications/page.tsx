'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, CheckCheck, Trash2 } from 'lucide-react'
import { Header } from '@/components/common/Header'
import { Sidebar } from '@/components/common/Sidebar'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Toast } from '@/components/common/Toast'
import { getUserDisplayName, roleToDashboard, useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { api } from '@/lib/api'
import { formatTanzaniaDateTime } from '@/lib/dates'
import { motion } from 'framer-motion'

interface AppNotification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  requestId?: string
}

function roleToSidebarRole(role?: string) {
  const normalized = String(role || '').toUpperCase()
  if (normalized === 'ADMIN') return 'admin'
  if (normalized === 'HEAD_OF_DEPARTMENT') return 'mkuu-idara'
  if (normalized === 'TRANSPORT_OFFICER') return 'afisa-usafirishaji'
  if (normalized === 'ADA_DAHRM') return 'ada-dahrm'
  if (normalized === 'PROCUREMENT') return 'ununuzi-ugavi'
  return 'mwombaji'
}

function SwipeNotification({
  notification,
  onDelete,
  onOpen,
  language,
}: {
  notification: AppNotification
  onDelete: (id: string) => void
  onOpen: (notification: AppNotification) => void
  language: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-y-0 right-0 flex w-28 items-center justify-center bg-danger-500 text-white">
        <Trash2 className="h-5 w-5" />
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -112, right: 0 }}
        dragElastic={0.06}
        onDragEnd={(_, info) => {
          if (info.offset.x < -86) onDelete(notification.id)
        }}
        onClick={() => onOpen(notification)}
        className={`relative rounded-2xl border p-4 shadow-sm ${
          notification.isRead
            ? 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
            : 'border-primary-200 bg-primary-50 dark:border-primary-900 dark:bg-primary-950/30'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <Bell className="mt-1 h-5 w-5 shrink-0 text-primary-500" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{notification.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
              <p className="mt-2 text-xs text-gray-400">
                <time dateTime={notification.createdAt}>
                  {formatTanzaniaDateTime(notification.createdAt, language === 'sw' ? 'sw-TZ' : 'en-US')}
                </time>
              </p>
            </div>
          </div>
          <button
            onClick={(event) => {
               event.stopPropagation()
               onDelete(notification.id)
            }}
            className="rounded-lg p-2 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20"
            aria-label="Delete notification"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { t, language } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchNotifications = async () => {
    setLoading(true)
    const response = await api.get<AppNotification[]>('/notifications?limit=50')
    if (response.success && response.data) setNotifications(response.data)
    else setToast({ type: 'error', message: response.error || 'Failed to fetch notifications' })
    setLoading(false)
  }

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

  const markAllRead = async () => {
    const response = await api.patch('/notifications/read-all', {})
    if (response.success) {
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })))
      setToast({ type: 'success', message: 'Notifications marked as read.' })
    }
  }

  const deleteNotification = async (id: string) => {
    const response = await api.delete(`/notifications/${id}`)
    if (response.success) setNotifications((items) => items.filter((item) => item.id !== id))
    else setToast({ type: 'error', message: response.error || 'Failed to delete notification' })
  }

  const openNotification = async (notification: AppNotification) => {
    if (!notification.isRead) {
      const response = await api.patch(`/notifications/${notification.id}/read`, {})
      if (response.success) {
        setNotifications((items) =>
          items.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item
          )
        )
      }
    }

    if (notification.requestId) {
      router.push(`/requests/${notification.requestId}`)
    }
  }

  const clearAll = async () => {
    if (!confirm('Delete all notifications?')) return
    const response = await api.delete('/notifications')
    if (response.success) setNotifications([])
    else setToast({ type: 'error', message: response.error || 'Failed to clear notifications' })
  }

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="flex h-screen bg-transparent">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <Sidebar role={roleToSidebarRole(user.role) as any} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={{ name: getUserDisplayName(user), role: user.role }} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Link href={roleToDashboard(user.role)} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('notifications_title')}</h1>
                  <p className="text-gray-500 dark:text-gray-400">{t('notifications_subtitle')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={markAllRead} className="rounded-xl border border-gray-200 px-4 py-2 text-sm dark:border-gray-700 dark:text-gray-200 flex items-center gap-2"><CheckCheck className="h-4 w-4" />{t('mark_all_read')}</button>
                <button onClick={clearAll} className="rounded-xl bg-danger-500 px-4 py-2 text-sm text-white flex items-center gap-2"><Trash2 className="h-4 w-4" />{t('clear_all')}</button>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-16"><LoadingSpinner size="lg" /></div>
              ) : notifications.length > 0 ? notifications.map((notification) => (
                <SwipeNotification
                  key={notification.id}
                  notification={notification}
                  onDelete={deleteNotification}
                  onOpen={openNotification}
                  language={language}
                />
              )) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
                  <Bell className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">{t('no_notifications')}</h2>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
