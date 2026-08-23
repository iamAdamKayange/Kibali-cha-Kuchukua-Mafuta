'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Activity, BarChart3, Clock, FileText, Fuel, UserPlus, Users, ArrowRight, X } from 'lucide-react'
import { Footer } from '@/components/common/Footer'
import { Header } from '@/components/common/Header'
import { Sidebar } from '@/components/common/Sidebar'
import { WorkflowGuide } from '@/components/dashboard/WorkflowGuide'
import { getUserDisplayName, useAuth } from '@/contexts/AuthContext'
import { formatTanzaniaDate, toTanzaniaIsoString } from '@/lib/dates'
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
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState<AdminStats>(emptyStats)
  const [users, setUsers] = useState<User[]>([])
  const [requests, setRequests] = useState<FuelRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<{
    title: string
    requests: FuelRequest[]
  } | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    let mounted = true

    async function fetchDashboard() {
      setLoading(true)
      setError('')

      const [statsResponse, usersResponse, requestsResponse] = await Promise.all([
        api.get<AdminStats>('/admin/stats'),
        api.get<User[]>('/admin/users?limit=8'),
        api.get<FuelRequest[]>('/fuel-requests?limit=100'),
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

  const getDepartmentName = (req: FuelRequest) => {
    const dep = req.department
    if (!dep) return 'N/A'
    if (typeof dep === 'string') return dep
    if (typeof dep === 'object' && 'name' in dep) return dep.name
    return 'N/A'
  }

  const handleStatCardClick = (label: string) => {
    if (label === 'Watumiaji Wote' || label === 'Watumiaji Active') {
      router.push('/dashboard/admin/users')
      return
    }

    let filtered = requests
    if (label === 'Maombi Yanasubiri') {
      filtered = requests.filter((req) => {
        const s = String(req.status).toLowerCase()
        return s.includes('pending') || s === 'submitted'
      })
    } else if (label === 'Maombi Yamekamilika') {
      filtered = requests.filter((req) =>
        ['completed', 'COMPLETED', 'FUEL_ISSUED', 'fuel_issued'].includes(String(req.status).toUpperCase())
      )
    } else if (label === 'Lita Zilizotolewa') {
      filtered = requests.filter(
        (req) => Number(req.issuedLitres || req.approvedLitres || req.litres || req.requestedLitres || 0) > 0
      )
    }

    setSelectedFilter({
      title: label,
      requests: filtered,
    })
  }

  return (
    <div className="flex h-screen bg-transparent">
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
                onClick={() => handleStatCardClick(stat.label)}
                className="app-panel p-4 cursor-pointer hover:border-primary-500/40 hover:shadow-md transition-all duration-200"
              >
                <stat.icon className={`mb-3 h-5 w-5 ${stat.color}`} />
                <p className="text-2xl font-black text-gray-900 dark:text-white">{loading ? '...' : stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="app-panel p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity ya Hivi Karibuni</h2>
                <Link href="/dashboard/admin/users" className="text-sm font-medium text-primary-600 dark:text-primary-400">Watumiaji wote</Link>
              </div>
              <div className="space-y-3">
                {requests.length > 0 ? requests.slice(0, 8).map((request) => (
                  <Link 
                    key={request.id} 
                    href={`/requests/${request.id}`}
                    className="flex items-center justify-between rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-950/60 dark:hover:bg-gray-900/60 p-3 text-sm cursor-pointer transition-colors duration-200 border border-transparent hover:border-primary-500/20 group"
                  >
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">{request.requestNumber}</p>
                      <p className="text-gray-500 dark:text-gray-400">{request.applicantName || request.driver?.firstName || 'Mwombaji'} - {request.status}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      <time dateTime={toTanzaniaIsoString(request.createdAt)}>
                        {formatTanzaniaDate(request.createdAt)}
                      </time>
                    </span>
                  </Link>
                )) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hakuna activity ya maombi bado.</p>
                )}
              </div>
            </section>

            <section className="app-panel p-5">
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

          <Footer />
        </main>
      </div>

      {/* Filter Modal Dialog */}
      {selectedFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in"
          >
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/20">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedFilter.title}</h3>
              <button 
                onClick={() => setSelectedFilter(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-white dark:bg-slate-900">
              {selectedFilter.requests.length > 0 ? (
                selectedFilter.requests.map((req) => (
                  <Link 
                    key={req.id} 
                    href={`/requests/${req.id}`}
                    onClick={() => setSelectedFilter(null)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 hover:border-primary-500/40 transition-all duration-200 group"
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-950 dark:text-white group-hover:text-primary-500 transition-colors">
                        {req.requestNumber}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {req.applicantName || 'Mwombaji'} &bull; {getDepartmentName(req)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {req.litres || req.requestedLitres || 0}L ({(req.fuelType || '').toLowerCase()})
                      </span>
                      <span className="text-xs text-slate-400">
                        <time dateTime={toTanzaniaIsoString(req.createdAt)}>
                          {formatTanzaniaDate(req.createdAt)}
                        </time>
                      </span>
                      <span className="text-xs font-semibold text-primary-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Angalia <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                  Hakuna maombi katika kundi hili kwa sasa.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

