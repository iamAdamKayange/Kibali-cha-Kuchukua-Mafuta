'use client'

import { useMemo, useState } from 'react'
import {
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  Fuel,
  XCircle,
  ArrowRight,
  X
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useRequests } from '@/hooks/useRequests'

export default function AdminReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<{
    title: string
    requests: typeof requests
  } | null>(null)

  const getDepartmentName = (req: typeof requests[0]) => {
    const dep = req.department
    if (!dep) return 'N/A'
    if (typeof dep === 'string') return dep
    if (typeof dep === 'object' && 'name' in dep) return dep.name
    return 'N/A'
  }

  const handleStatCardClick = (label: string) => {
    let filtered = requests
    if (label === 'Yanasubiri') {
      filtered = requests.filter((req) => {
        const s = String(req.status).toLowerCase()
        return s.includes('pending') || s === 'submitted'
      })
    } else if (label === 'Yameidhinishwa') {
      filtered = requests.filter((req) =>
        ['approved', 'APPROVED', 'COMPLETED', 'completed', 'FUEL_ISSUED', 'fuel_issued'].includes(String(req.status).toUpperCase())
      )
    } else if (label === 'Yamekataliwa') {
      filtered = requests.filter((req) =>
        ['rejected', 'REJECTED'].includes(String(req.status).toUpperCase())
      )
    } else if (label === 'Jumla ya Lita') {
      filtered = requests.filter(
        (req) => Number(req.issuedLitres || req.approvedLitres || req.litres || req.requestedLitres || 0) > 0
      )
    }

    setSelectedFilter({
      title: label,
      requests: filtered,
    })
  }

  const {
    requests,
    loading,
    error,
    total,
  } = useRequests({
    autoFetch: true,
    limit: 100,
  })

  const report = useMemo(() => {
    const approved = requests.filter((request) =>
      [
        'approved',
        'APPROVED',
        'COMPLETED',
        'completed',
        'FUEL_ISSUED',
      ].includes(String(request.status))
    )

    const pending = requests.filter((request) => {
      const status = String(request.status).toLowerCase()

      return (
        status.includes('pending') ||
        status === 'submitted'
      )
    })

    const rejected = requests.filter((request) =>
      ['rejected', 'REJECTED'].includes(String(request.status))
    )

    /**
     * Calculate total litres.
     */
    const litres = requests.reduce((sum, request) => {
      const value =
        request.issuedLitres ??
        request.approvedLitres ??
        request.litres ??
        request.requestedLitres ??
        0

      return sum + Number(value || 0)
    }, 0)

    /**
     * Group requests by department.
     *
     * Backend may return department as:
     *
     * 1. string
     *    "Transport"
     *
     * OR
     *
     * 2. object
     *    {
     *      id: "...",
     *      name: "Transport"
     *    }
     */
    const departments = requests.reduce<Record<string, number>>(
      (acc, request) => {
        let key = 'N/A'

        if (typeof request.department === 'string') {
          key = request.department.trim() || 'N/A'
        } else if (
          request.department &&
          typeof request.department === 'object'
        ) {
          key =
            typeof request.department.name === 'string' &&
            request.department.name.trim()
              ? request.department.name.trim()
              : 'N/A'
        }

        acc[key] = (acc[key] || 0) + 1

        return acc
      },
      {}
    )

    return {
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      litres,
      departments,
    }
  }, [requests])

  const stats = [
    {
      label: 'Maombi Yote',
      value: total || requests.length,
      icon: FileText,
      color: 'text-primary-500',
    },
    {
      label: 'Yanasubiri',
      value: report.pending,
      icon: Clock,
      color: 'text-warning-500',
    },
    {
      label: 'Yameidhinishwa',
      value: report.approved,
      icon: CheckCircle,
      color: 'text-success-500',
    },
    {
      label: 'Yamekataliwa',
      value: report.rejected,
      icon: XCircle,
      color: 'text-danger-500',
    },
    {
      label: 'Jumla ya Lita',
      value: report.litres,
      icon: Fuel,
      color: 'text-blue-500',
    },
  ]

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={{
            name: 'Msimamizi',
            role: 'Admin',
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Taarifa
            </h1>

            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Muhtasari wa matumizi na mwenendo wa maombi kutoka backend.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-900/40 dark:bg-danger-900/20 dark:text-danger-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* Statistics */}
              <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    onClick={() => handleStatCardClick(stat.label)}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 cursor-pointer hover:border-primary-500/40 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                        <stat.icon
                          className={`h-5 w-5 ${stat.color}`}
                        />
                      </div>

                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Requests by Department */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <BarChart3 className="h-5 w-5 text-primary-500" />

                  Maombi kwa Idara
                </h2>

                {Object.keys(report.departments).length === 0 ? (
                  <div className="py-8 text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-gray-400" />

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Hakuna taarifa za maombi kwa sasa.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(report.departments)
                      .sort(([, a], [, b]) => b - a)
                      .map(([department, count]) => (
                        <div key={department}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">
                              {department}
                            </span>

                            <span className="font-medium text-gray-900 dark:text-white">
                              {count}
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                            <div
                              className="h-full rounded-full bg-primary-500 transition-all duration-500"
                              style={{
                                width: `${Math.max(
                                  8,
                                  (count /
                                    Math.max(
                                      1,
                                      requests.length
                                    )) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Filter Modal Dialog */}
      {selectedFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
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
                        {req.applicantName || (req as any).applicant || 'Mwombaji'} • {getDepartmentName(req)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {req.litres || (req as any).requestedLitres || 0}L ({(req.fuelType || '').toLowerCase()})
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(req.createdAt || (req as any).date).toLocaleDateString('sw-TZ')}
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