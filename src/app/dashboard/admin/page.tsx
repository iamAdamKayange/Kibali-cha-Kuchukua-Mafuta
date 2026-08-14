'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Activity, BarChart3, Clock, FileText, Fuel, UserPlus, Users } from 'lucide-react'
import { Header } from '@/components/common/Header'
import { Sidebar } from '@/components/common/Sidebar'
import { WorkflowGuide } from '@/components/dashboard/WorkflowGuide'
import { getUserDisplayName, useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import type { FuelRequest, User } from '@/types'

interface AdminStats {
  users: {
    total: number
    active: number
    inactive: number
  }
  requests: {
    total: number
    pending: number
    completed: number
  }
  fuel: {
    totalIssued: number
  }
}

const emptyStats: AdminStats = {
  users: { total: 0, active: 0, inactive: 0 },
  requests: { total: 0, pending: 0, completed: 0 },
  fuel: { totalIssued: 0 },
}

function fullName(user: User) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState<AdminStats>(emptyStats)
  const [users, setUsers] = useState<User[]>([])
  const [requests, setRequests] = useState<FuelRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    let mounted = true

    async function fetchDashboard() {
      setLoading(true)
      setError('')

      const [statsResponse, usersResponse, requestsResponse] = await Promise.all([
        api.get<AdminStats>('/admin/stats'),
        api.get<User[]>('/admin/users?limit=8'),
        api.get<FuelRequest[]>('/fuel-requests?limit=8'),
      ])

      if (!mounted) return

      if (statsResponse.success && statsResponse.data) setStats(statsResponse.data)
      else setError(statsResponse.error || 'Failed to load admin statistics')

      if (usersResponse.success && usersResponse.data) setUsers(usersResponse.data)
      if (requestsResponse.success && requestsResponse.data) setRequests(requestsResponse.data)

      setLoading(false)
    }

    fetchDashboard()

    return () => {
      mounted = false
    }
  }, [])

  const roleDistribution = useMemo(() => {
    const counts = users.reduce<Record<string, number>>((acc, item) => {
      acc[String(item.role)] = (acc[String(item.role)] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts).map(([role, count]) => ({ role, count }))
  }, [users])

  const statCards = [
    { label: 'Watumiaji Wote', value: stats.users.total, icon: Users, color: 'text-primary-500' },
    { label: 'Watumiaji Active', value: stats.users.active, icon: UserPlus, color: 'text-success-500' },
    { label: 'Maombi Yote', value: stats.requests.total, icon: Activity, color: 'text-blue-500' },
    { label: 'Maombi Yanasubiri', value: stats.requests.pending, icon: Clock, color: 'text-warning-500' },
    { label: 'Maombi Yamekamilika', value: stats.requests.completed, icon: FileText, color: 'text-success-500' },
    { label: 'Lita Zilizotolewa', value: stats.fuel.totalIssued, icon: Fuel, color: 'text-cyan-500' },
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={{ name: getUserDisplayName(user), role: 'Admin' }} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashibodi ya Msimamizi</h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">Watumiaji, maombi, takwimu na activity ya mfumo kutoka backend.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/admin/register" className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-3 font-medium text-white transition hover:bg-primary-600">
                <UserPlus className="h-5 w-5" />
                Sajili Mtumiaji
              </Link>
              <Link href="/dashboard/admin/reports" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
                <BarChart3 className="h-5 w-5" />
                Ripoti
              </Link>
            </div>
          </div>

          <WorkflowGuide currentRole="admin" />

          {error && (
            <div className="mb-6 rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-900/40 dark:bg-danger-900/20 dark:text-danger-300">
              {error}
            </div>
          )}

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <stat.icon className={`mb-3 h-5 w-5 ${stat.color}`} />
                <p className="text-2xl font-black text-gray-900 dark:text-white">{loading ? '...' : stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity ya Hivi Karibuni</h2>
                <Link href="/dashboard/admin/users" className="text-sm font-medium text-primary-600 dark:text-primary-400">Watumiaji wote</Link>
              </div>
              <div className="space-y-3">
                {requests.length > 0 ? requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-sm dark:bg-gray-950/60">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{request.requestNumber}</p>
                      <p className="text-gray-500 dark:text-gray-400">{request.applicantName || request.driver?.firstName || 'Mwombaji'} - {request.status}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(request.createdAt).toLocaleDateString('sw-TZ')}</span>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hakuna activity ya maombi bado.</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Mgawanyo wa Roles</h2>
              <div className="space-y-3">
                {roleDistribution.length > 0 ? roleDistribution.map((item) => (
                  <div key={item.role}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{item.role}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                      <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.max((item.count / Math.max(users.length, 1)) * 100, 8)}%` }} />
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hakuna watumiaji waliopatikana.</p>
                )}
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Watumiaji Wapya</h3>
                <div className="space-y-2">
                  {users.slice(0, 4).map((item) => (
                    <div key={item.id} className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">{fullName(item)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
