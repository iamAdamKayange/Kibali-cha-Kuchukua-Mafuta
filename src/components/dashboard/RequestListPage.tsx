'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, FileText, Fuel, ListChecks, PlusCircle, Search, X } from 'lucide-react'
import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { RequestCard } from '@/components/requests/RequestCard'
import { useRequests } from '@/hooks/useRequests'
import type { FuelRequest } from '@/types'

type DashboardRole = 'mwombaji' | 'mkuu-idara' | 'afisa-usafirishaji' | 'ada-dahrm' | 'ununuzi-ugavi'
type PageMode = 'mine' | 'pending' | 'all' | 'history'

const roleLabels: Record<DashboardRole, string> = {
  mwombaji: 'Mwombaji/Dereva',
  'mkuu-idara': 'Mkuu wa Idara',
  'afisa-usafirishaji': 'Afisa Usafirishaji',
  'ada-dahrm': 'ADA',
  'ununuzi-ugavi': 'Ununuzi na Ugavi',
}

const pendingStatusByRole: Record<Exclude<DashboardRole, 'mwombaji'>, string[]> = {
  'mkuu-idara': ['PENDING_HEAD_APPROVAL'],
  'afisa-usafirishaji': ['PENDING_TRANSPORT_APPROVAL'],
  'ada-dahrm': ['PENDING_DA_APPROVAL'],
  'ununuzi-ugavi': ['PENDING_FUEL_ISSUANCE'],
}

const pageCopy: Record<PageMode, { title: string; description: string; empty: string }> = {
  mine: {
    title: 'Maombi Yangu',
    description: 'Orodha ya maombi yako yote ya mafuta kutoka backend.',
    empty: 'Hakuna maombi yaliyopatikana.',
  },
  pending: {
    title: 'Maombi Yanayosubiri',
    description: 'Maombi yanayohitaji hatua yako ya kukagua au kuidhinisha.',
    empty: 'Hakuna maombi yanayosubiri kwa sasa.',
  },
  all: {
    title: 'Maombi Yote',
    description: 'Fuatilia maombi yote yanayopita kwenye hatua yako.',
    empty: 'Hakuna maombi yaliyopatikana.',
  },
  history: {
    title: 'Historia ya Mafuta',
    description: 'Maombi yaliyokamilika, yaliyoidhinishwa, au kukataliwa.',
    empty: 'Hakuna historia ya mafuta bado.',
  },
}

const pendingStatuses = [
  'pending',
  'submitted',
  'PENDING',
  'SUBMITTED',
  'PENDING_HEAD_APPROVAL',
  'PENDING_TRANSPORT_APPROVAL',
  'PENDING_DA_APPROVAL',
  'PENDING_FUEL_ISSUANCE',
]

const historyStatuses = [
  'approved',
  'rejected',
  'completed',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
  'HEAD_APPROVED',
  'TRANSPORT_APPROVED',
  'ADA_APPROVED',
  'FUEL_ISSUED',
]

function requestText(request: FuelRequest) {
  return [
    request.requestNumber,
    request.applicantName,
    request.applicantId,
    request.department,
    request.vehicleNumber,
    request.fuelType,
    request.status,
    request.currentStage,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function requestLitres(request: FuelRequest) {
  return request.issuedLitres || request.approvedLitres || request.litres || request.requestedLitres || 0
}

function isPendingForRole(request: FuelRequest, role: DashboardRole) {
  if (role === 'mwombaji') {
    return pendingStatuses.includes(request.status)
  }

  return pendingStatusByRole[role].includes(String(request.status || '').toUpperCase())
}

function isHistory(request: FuelRequest) {
  return historyStatuses.includes(request.status)
}

interface RequestListPageProps {
  role: DashboardRole
  mode: PageMode
}

export function RequestListPage({ role, mode }: RequestListPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const { requests, loading, error, total, refetch } = useRequests({ autoFetch: true, limit: 50 })
  const copy = pageCopy[mode]

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return requests.filter((request) => {
      if (mode === 'pending' && !isPendingForRole(request, role)) return false
      if (mode === 'history' && !isHistory(request)) return false
      if (normalizedSearch && !requestText(request).includes(normalizedSearch)) return false
      return true
    })
  }, [mode, requests, role, search])

  const stats = [
    { label: 'Jumla', value: total || requests.length, icon: FileText, color: 'text-primary-500' },
    { label: 'Yanasubiri', value: requests.filter((request) => isPendingForRole(request, role)).length, icon: Clock, color: 'text-warning-500' },
    { label: 'Historia', value: requests.filter(isHistory).length, icon: ListChecks, color: 'text-success-500' },
    { label: 'Lita', value: requests.reduce((sum, request) => sum + requestLitres(request), 0), icon: Fuel, color: 'text-blue-500' },
  ]

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={{ name: role === 'mwombaji' ? 'Adam Mwakyoma' : roleLabels[role], role: roleLabels[role] }}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{copy.title}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{copy.description}</p>
            </div>
            {role === 'mwombaji' && (
              <Link
                href="/requests/new"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-primary-500/30"
              >
                <PlusCircle className="w-5 h-5" />
                Omba Mafuta
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tafuta kwa namba, mwombaji, idara, au gari..."
                  className="input-field pl-10"
                />
              </div>
              <div className="flex gap-2">
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Futa
                  </button>
                )}
                <button
                  onClick={refetch}
                  className="px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-900 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                >
                  Refresh
                </button>
              </div>
            </div>
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
          ) : filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{copy.empty}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Jaribu kubadilisha utafutaji au bonyeza refresh kupata taarifa mpya.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
