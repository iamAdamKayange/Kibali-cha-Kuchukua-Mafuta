'use client'

import { useMemo, useState } from 'react'
import { BarChart3, CheckCircle, Clock, FileText, Fuel, XCircle } from 'lucide-react'
import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useRequests } from '@/hooks/useRequests'

export default function AdminReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { requests, loading, error, total } = useRequests({ autoFetch: true, limit: 100 })

  const report = useMemo(() => {
    const approved = requests.filter((request) => ['approved', 'APPROVED', 'COMPLETED', 'completed', 'FUEL_ISSUED'].includes(request.status))
    const pending = requests.filter((request) => String(request.status).toLowerCase().includes('pending') || request.status === 'submitted')
    const rejected = requests.filter((request) => ['rejected', 'REJECTED'].includes(request.status))

    return {
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      litres: requests.reduce((sum, request) => sum + (request.issuedLitres || request.approvedLitres || request.litres || request.requestedLitres || 0), 0),
      departments: requests.reduce<Record<string, number>>((acc, request) => {
        const key = request.department || 'N/A'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {}),
    }
  }, [requests])

  const stats = [
    { label: 'Maombi Yote', value: total || requests.length, icon: FileText, color: 'text-primary-500' },
    { label: 'Yanasubiri', value: report.pending, icon: Clock, color: 'text-warning-500' },
    { label: 'Yameidhinishwa', value: report.approved, icon: CheckCircle, color: 'text-success-500' },
    { label: 'Yamekataliwa', value: report.rejected, icon: XCircle, color: 'text-danger-500' },
    { label: 'Jumla ya Lita', value: report.litres, icon: Fuel, color: 'text-blue-500' },
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={{ name: 'Msimamizi', role: 'Admin' }} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Taarifa</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Muhtasari wa matumizi na mwenendo wa maombi kutoka backend.</p>
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
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-500" />
                  Maombi kwa Idara
                </h2>
                <div className="space-y-3">
                  {Object.entries(report.departments).map(([department, count]) => (
                    <div key={department}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{department}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500"
                          style={{ width: `${Math.max(8, (count / Math.max(1, requests.length)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
