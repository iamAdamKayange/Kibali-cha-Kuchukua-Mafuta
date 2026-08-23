'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Clock, FileText, Fuel, ListChecks, XCircle, ArrowRight, X, Info, ChevronDown, type LucideIcon } from 'lucide-react'
import { Footer } from '@/components/common/Footer'
import { Header } from '@/components/common/Header'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Sidebar } from '@/components/common/Sidebar'
import { RequestCard } from '@/components/requests/RequestCard'
import { getUserDisplayName, useAuth } from '@/contexts/AuthContext'
import { formatTanzaniaDate, toTanzaniaIsoString } from '@/lib/dates'
import { useRequests } from '@/hooks/useRequests'
import type { FuelRequest } from '@/types'
import { WorkflowGuide, type WorkflowRole } from './WorkflowGuide'

type RoleDashboardKey = Exclude<WorkflowRole, 'admin'>

const copy: Record<RoleDashboardKey, {
  title: string
  subtitle: string
  description: string
  responsibilities: string[]
  pendingTitle: string
  actionLabel: string
  pendingHref: string
  sidebarRole: RoleDashboardKey
  icon: LucideIcon
}> = {
  mwombaji: {
    title: 'Dashibodi ya Mwombaji/Dereva',
    subtitle: 'Omba mafuta na fuatilia maombi yako kutoka backend.',
    description: 'Wewe ndiye mwanzishaji wa mchakato wa kupata mafuta. Jukumu lako ni kuwasilisha maombi sahihi na kufuatilia hali yake hadi mafuta yatoleewe.',
    responsibilities: [
      'Jaza fomu ya ombi la mafuta kwa usahihi &mdash; gari, kilomita, lita zinazohitajika, na madhumuni ya safari.',
      'Fuatilia hali ya ombi lako kupitia mfumo hadi liidhinishwe au likataliwe.',
      'Pokea mafuta baada ya ombi kupitishwa na hatua zote kukamilika.',
      'Hakikisha taarifa za gari (kilomita, logbook) ni sahihi kabla ya kuomba.',
    ],
    pendingTitle: 'Maombi yako ya hivi karibuni',
    actionLabel: 'Omba Mafuta',
    pendingHref: '/requests/new',
    sidebarRole: 'mwombaji',
    icon: Fuel,
  },
  'mkuu-idara': {
    title: 'Dashibodi ya Mkuu wa Idara',
    subtitle: 'Kagua, idhinisha au kataa maombi ya idara yako.',
    description: 'Wewe ni mhimili wa kwanza wa idhini. Jukumu lako ni kuhakikisha maombi ya mafuta kutoka idara yako ni halali na yanastahili kabla ya kupelekwa hatua inayofuata.',
    responsibilities: [
      'Kagua maombi ya mafuta yanayotoka kwa wafanyakazi wa idara yako.',
      'Hakiki kuwa madhumuni ya safari na kiwango cha mafuta kinachoombwa ni sahihi.',
      'Idhinisha maombi yanayostahili au kataa yenye sababu wazi.',
      'Weka saini ya kidijitali na cheo chako kwenye idhini.',
    ],
    pendingTitle: 'Maombi Yanayosubiri Idhini',
    actionLabel: 'Kagua Maombi',
    pendingHref: '/dashboard/mkuu-idara/pending',
    sidebarRole: 'mkuu-idara',
    icon: ListChecks,
  },
  'afisa-usafirishaji': {
    title: 'Dashibodi ya Afisa Usafirishaji',
    subtitle: 'Hakiki gari, logbook, kilomita na lita kabla ya kuamua.',
    description: 'Wewe ni mtaalamu wa usafirishaji. Jukumu lako ni kuhakikisha taarifa za gari, logbook, na kilomita ni sahihi kabla ya kuidhinisha ombi.',
    responsibilities: [
      'Hakiki namba ya gari, hali ya gari, na logbook kabla ya kuidhinisha.',
      'Thibitisha kilomita za kuanzia na za sasa zinaendana na matumizi halisi.',
      'Amua kiwango cha lita kinachostahili kupewa kulingana na safari na gari.',
      'Idhinisha au kataa ombi kwa sababu za kiufundi za usafirishaji.',
    ],
    pendingTitle: 'Maombi Yanayosubiri Ukaguzi',
    actionLabel: 'Kagua Usafirishaji',
    pendingHref: '/dashboard/afisa-usafirishaji/pending',
    sidebarRole: 'afisa-usafirishaji',
    icon: ListChecks,
  },
  'ada-dahrm': {
    title: 'Dashibodi ya ADA',
    subtitle: 'Toa idhini ya mwisho au kataa ombi lenye sababu.',
    description: 'Wewe ni mamlaka ya mwisho ya kuidhinisha. Baada ya Mkuu wa Idara na Afisa Usafirishaji kuthibitisha, wewe unatoa idhini ya mwisho kabla ya mafuta kutolewa.',
    responsibilities: [
      'Kagua maombi yaliyopitishwa na Mkuu wa Idara na Afisa Usafirishaji.',
      'Toa idhini ya mwisho kwa maombi yanayostahili.',
      'Kataa maombi ambayo hayakidhi vigezo kwa sababu iliyo wazi na kumbukumbu.',
      'Amua kiwango cha mwisho cha lita zinazopaswa kutolewa.',
    ],
    pendingTitle: 'Maombi Yanayosubiri Idhini ya ADA',
    actionLabel: 'Kagua Maombi',
    pendingHref: '/dashboard/ada-dahrm/pending',
    sidebarRole: 'ada-dahrm',
    icon: CheckCircle,
  },
  'ununuzi-ugavi': {
    title: 'Dashibodi ya Ununuzi na Ugavi',
    subtitle: 'Toa mafuta kwa maombi yaliyoidhinishwa na weka token number.',
    description: 'Wewe ni mtendaji wa hatua ya mwisho. Baada ya idhini zote kukamilika, unatekeleza utoaji wa mafuta na kufunga ombi kwenye mfumo.',
    responsibilities: [
      'Toa mafuta kwa maombi yaliyopata idhini kamili ya ADA.',
      'Weka token number ya mafuta kwenye mfumo kwa kumbukumbu.',
      'Rekodi kiwango halisi cha lita zilizotolewa.',
      'Funga ombi kwenye mfumo baada ya mafuta kutolewa.',
    ],
    pendingTitle: 'Maombi Yaliyo Tayari Kutolewa Mafuta',
    actionLabel: 'Toa Mafuta',
    pendingHref: '/dashboard/ununuzi-ugavi/pending',
    sidebarRole: 'ununuzi-ugavi',
    icon: Fuel,
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

const rejectedStatuses = ['rejected', 'REJECTED', 'HEAD_REJECTED', 'TRANSPORT_REJECTED', 'ADA_REJECTED', 'CANCELLED']
const completedStatuses = ['completed', 'COMPLETED', 'FUEL_ISSUED']

function litres(request: FuelRequest) {
  return request.issuedLitres || request.approvedLitres || request.litres || request.requestedLitres || 0
}

function isPending(request: FuelRequest) {
  return pendingStatuses.includes(request.status)
}

export function RoleDashboard({ role }: { role: RoleDashboardKey }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user } = useAuth()
  const [selectedFilter, setSelectedFilter] = useState<{
    title: string
    requests: FuelRequest[]
  } | null>(null)
  const [roleDetailsOpen, setRoleDetailsOpen] = useState(false)

  const getDepartmentName = (req: FuelRequest) => {
    const dep = req.department
    if (!dep) return 'N/A'
    if (typeof dep === 'string') return dep
    if (typeof dep === 'object' && 'name' in dep) return dep.name
    return 'N/A'
  }

  const handleStatCardClick = (label: string) => {
    let filtered = requests
    if (label === 'Yanasubiri') {
      filtered = requests.filter(isPending)
    } else if (label === 'Yamekataliwa') {
      filtered = requests.filter((request) => rejectedStatuses.includes(request.status))
    } else if (label === 'Yamekamilika') {
      filtered = requests.filter((request) => completedStatuses.includes(request.status))
    } else if (label === 'Jumla ya Lita') {
      filtered = requests.filter((request) => litres(request) > 0)
    }

    setSelectedFilter({
      title: label,
      requests: filtered,
    })
  }

  const { requests, loading, error, total } = useRequests({ autoFetch: true, limit: 20 })
  const page = copy[role]
  const Icon = page.icon

  const pending = useMemo(() => requests.filter(isPending).slice(0, 6), [requests])
  const stats = [
    { label: 'Maombi Yote', value: total || requests.length, icon: FileText, color: 'text-primary-500' },
    { label: 'Yanasubiri', value: requests.filter(isPending).length, icon: Clock, color: 'text-warning-500' },
    { label: 'Yamekataliwa', value: requests.filter((request) => rejectedStatuses.includes(request.status)).length, icon: XCircle, color: 'text-danger-500' },
    { label: 'Jumla ya Lita', value: requests.reduce((sum, request) => sum + litres(request), 0), icon: Fuel, color: 'text-blue-500' },
  ]

  if (role === 'mwombaji') {
    stats[2] = { label: 'Yamekamilika', value: requests.filter((request) => completedStatuses.includes(request.status)).length, icon: CheckCircle, color: 'text-success-500' }
  }

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar role={page.sidebarRole} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={{ name: getUserDisplayName(user), role: page.title.replace('Dashibodi ya ', '') }} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{page.title}</h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">{page.subtitle}</p>
            </div>
            <Link href={page.pendingHref} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 py-3 font-medium text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-600">
              <Icon className="h-5 w-5" />
              {page.actionLabel}
            </Link>
          </div>

          {/* Role Details Expandable Card */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-primary-200/60 bg-primary-50/50 dark:border-primary-900/40 dark:bg-primary-900/10 overflow-hidden"
          >
            <button
              onClick={() => setRoleDetailsOpen(!roleDetailsOpen)}
              className="w-full flex items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-primary-100/40 dark:hover:bg-primary-900/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
                  <Info className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Maelezo ya Jukumu Lako</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{page.subtitle}</p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${roleDetailsOpen ? 'rotate-180' : ''}`} />
            </button>

            {roleDetailsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-primary-200/40 dark:border-primary-900/30 px-4 pb-4 pt-3"
              >
                <p className="mb-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {page.description}
                </p>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  Majukumu Yako
                </h4>
                <ul className="space-y-1.5">
                  {page.responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.section>

          <WorkflowGuide currentRole={role} />

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                onClick={() => handleStatCardClick(stat.label)}
                className="app-panel p-4 cursor-pointer hover:border-primary-500/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <AlertCircle className="h-5 w-5 text-warning-500" />
              {page.pendingTitle}
            </h2>
            <Link href={role === 'mwombaji' ? '/dashboard/mwombaji/requests' : page.pendingHref} className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Ona yote
            </Link>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-900/40 dark:bg-danger-900/20 dark:text-danger-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-14">
              <LoadingSpinner size="lg" />
            </div>
          ) : pending.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pending.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="app-panel p-10 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hakuna maombi ya kuonyesha kwa sasa.</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Data itaonekana hapa baada ya backend kurudisha maombi yanayohusika na role yako.</p>
            </div>
          )}

          <Footer />
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
                        {req.applicantName || (req as any).applicant || 'Mwombaji'} &bull; {getDepartmentName(req)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {req.litres || (req as any).requestedLitres || 0}L ({(req.fuelType || '').toLowerCase()})
                      </span>
                      <span className="text-xs text-slate-400">
                        <time dateTime={toTanzaniaIsoString(req.createdAt || (req as any).date)}>
                          {formatTanzaniaDate(req.createdAt || (req as any).date)}
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

