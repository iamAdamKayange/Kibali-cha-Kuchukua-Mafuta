'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Building, Calendar, Car, FileText, Fuel, Gauge, MapPin, User } from 'lucide-react'
import { Header } from '@/components/common/Header'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Sidebar } from '@/components/common/Sidebar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SectionBForm, type SectionBData } from '@/components/forms/SectionBForm'
import { SectionCForm, type SectionCData } from '@/components/forms/SectionCForm'
import { SectionDForm, type SectionDData } from '@/components/forms/SectionDForm'
import { SectionEForm, type SectionEData } from '@/components/forms/SectionEForm'
import { RequestTimeline } from '@/components/requests/RequestTimeline'
import { getUserDisplayName, roleToDashboard, useAuth } from '@/contexts/AuthContext'
import { useRequests } from '@/hooks/useRequests'
import type { FuelRequest } from '@/types'

type SidebarRole = 'admin' | 'mwombaji' | 'mkuu-idara' | 'afisa-usafirishaji' | 'ada-dahrm' | 'ununuzi-ugavi'

interface ApprovalRecord {
  stage: string
  approved: boolean
  reason?: string | null
  approvedAt?: string | Date
  approver?: {
    firstName?: string
    lastName?: string
    email?: string
  }
}

interface DetailRequest extends FuelRequest {
  approvals?: ApprovalRecord[]
}

function sidebarRole(role?: string): SidebarRole {
  switch (String(role || '').toUpperCase()) {
    case 'ADMIN':
      return 'admin'
    case 'HEAD_OF_DEPARTMENT':
      return 'mkuu-idara'
    case 'TRANSPORT_OFFICER':
      return 'afisa-usafirishaji'
    case 'ADA_DAHRM':
      return 'ada-dahrm'
    case 'PROCUREMENT':
      return 'ununuzi-ugavi'
    default:
      return 'mwombaji'
  }
}

function approvalStage(role?: string) {
  switch (String(role || '').toUpperCase()) {
    case 'HEAD_OF_DEPARTMENT':
      return 'head'
    case 'TRANSPORT_OFFICER':
      return 'transport'
    case 'ADA_DAHRM':
      return 'ada'
    default:
      return ''
  }
}

function normalizeStatus(status: string): 'pending' | 'submitted' | 'approved' | 'rejected' | 'completed' {
  if (status.includes('REJECTED') || status === 'CANCELLED') return 'rejected'
  if (status === 'COMPLETED' || status === 'FUEL_ISSUED') return 'completed'
  if (status.includes('APPROVED')) return 'approved'
  if (status.includes('PENDING')) return 'pending'
  return 'submitted'
}

function applicantName(request: DetailRequest) {
  return request.applicantName || [request.driver?.firstName, request.driver?.lastName].filter(Boolean).join(' ') || request.applicantId || 'N/A'
}

function departmentName(request: DetailRequest) {
  const department = request.department || request.driver?.department
  if (!department) return 'N/A'
  return typeof department === 'string' ? department : department.name
}

function vehicleNumber(request: DetailRequest) {
  return request.vehicleNumber || request.vehicle?.vehicleNumber || 'N/A'
}

function requestLitres(request: DetailRequest) {
  return request.approvedLitres || request.requestedLitres || request.litres || 0
}

function timeline(request: DetailRequest) {
  const rejected = request.status.includes('REJECTED') || request.status === 'CANCELLED'
  const stageOrder = ['head', 'transport', 'ada']
  const labels = [
    { key: 'submitted', label: 'Ombi Limewasilishwa' },
    { key: 'head', label: 'Idhini ya Mkuu wa Idara' },
    { key: 'transport', label: 'Idhini ya Afisa Usafirishaji' },
    { key: 'ada', label: 'Idhini ya ADA' },
    { key: 'issue', label: 'Utoaji wa Mafuta' },
  ]

  return labels.map((item, index) => {
    if (item.key === 'submitted') {
      return {
        label: item.label,
        status: 'completed' as const,
        user: applicantName(request),
        date: new Date(request.createdAt).toLocaleString('sw-TZ'),
      }
    }

    const approval = request.approvals?.find((entry) => entry.stage?.toLowerCase().includes(item.key))
    if (approval) {
      return {
        label: item.label,
        status: approval.approved ? 'completed' as const : 'rejected' as const,
        user: [approval.approver?.firstName, approval.approver?.lastName].filter(Boolean).join(' ') || approval.approver?.email,
        date: approval.approvedAt ? new Date(approval.approvedAt).toLocaleString('sw-TZ') : undefined,
        reason: approval.reason || undefined,
      }
    }

    const currentByStatus: Record<string, string> = {
      PENDING_HEAD_APPROVAL: 'head',
      PENDING_TRANSPORT_APPROVAL: 'transport',
      PENDING_DA_APPROVAL: 'ada',
      PENDING_FUEL_ISSUANCE: 'issue',
    }
    const currentKey = currentByStatus[request.status]
    const completedBeforeCurrent = currentKey && index < labels.findIndex((label) => label.key === currentKey)
    const completedByStatus = request.status === 'COMPLETED'

    return {
      label: item.label,
      status: rejected ? 'pending' as const : currentKey === item.key ? 'current' as const : completedByStatus || completedBeforeCurrent || stageOrder.includes(item.key) && request.status.includes('PENDING_FUEL') ? 'completed' as const : 'pending' as const,
    }
  })
}

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id || '')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [request, setRequest] = useState<DetailRequest | null>(null)
  const [actionError, setActionError] = useState('')
  const { user } = useAuth()
  const { fetchRequest, approveRequest, rejectRequest, issueFuel, loading, error } = useRequests({ autoFetch: false })
  const role = sidebarRole(user?.role)
  const stage = approvalStage(user?.role)

  useEffect(() => {
    let mounted = true
    fetchRequest(id).then((result) => {
      if (mounted) setRequest(result as DetailRequest | null)
    })
    return () => {
      mounted = false
    }
  }, [fetchRequest, id])

  const summary = useMemo(() => {
    if (!request) return null
    return {
      applicant: applicantName(request),
      department: departmentName(request),
      litres: requestLitres(request),
      fuelType: String(request.fuelType),
      vehicleNumber: vehicleNumber(request),
    }
  }, [request])

  const audit = {
    actionBy: user?.id,
    actionRole: user?.role,
    actionAt: new Date().toISOString(),
    designation: user?.role || '',
    signature: user?.email || 'Confirmed electronically',
  }

  const afterAction = async () => {
    const fresh = await fetchRequest(id)
    setRequest(fresh as DetailRequest | null)
    router.refresh()
  }

const submitHead = async (data: SectionBData) => {
  setActionError('')

  const result =
    data.idhini === 'naridhia'
      ? await approveRequest(id, 'head', {
          ...audit,
          approved: true,
          reason: data.sababu,
          designation: data.cheo,
        })
      : await rejectRequest(id, 'head', data.sababu)

  if (result) {
    await afterAction()
  } else {
    setActionError(
      'Action failed. Please check the reason/designation and try again.'
    )
  }
}
const submitTransport = async (data: SectionCData) => {
  setActionError('')

  const result = data.apewe
    ? await approveRequest(id, 'transport', {
        ...audit,
        approved: true,
        litresApproved: data.lita,
        reason: data.sababu,
        logbookNumber: data.logbookNamba,
        logbookTo: data.to,
        designation: data.cheo,
      })
    : await rejectRequest(id, 'transport', data.sababu)

  if (result) {
    await afterAction()
  } else {
    setActionError(
      'Action failed. Please check the required fields and try again.'
    )
  }
}

const submitAda = async (data: SectionDData) => {
  setActionError('')

  const result = data.naridhia
    ? await approveRequest(id, 'ada', {
        ...audit,
        approved: true,
        litresApproved: data.lita,
        reason: data.sababu,
        designation: data.cheo,
      })
    : await rejectRequest(id, 'ada', data.sababu)

  if (result) {
    await afterAction()
  } else {
    setActionError(
      'Action failed. Please check the required fields and try again.'
    )
  }
}

  const submitIssue = async (data: SectionEData) => {
    setActionError('')
    const result = await issueFuel(id, {
      fuelType: data.fuelType.toUpperCase(),
      litresIssued: data.lita,
      tokenNumber: data.tokenNumber,
      designation: data.cheo,
      auditAction: 'ISSUE_FUEL',
      actionBy: user?.id,
      actionRole: user?.role,
      actionAt: new Date().toISOString(),
    })
    if (result) await afterAction()
    else setActionError('Fuel issuance failed. Please check token number and designation.')
  }

  const renderAction = () => {
    if (!request || !summary) return null
    if (!stage && role !== 'ununuzi-ugavi') return null

    if (role === 'mkuu-idara' && request.status === 'PENDING_HEAD_APPROVAL') {
      return <SectionBForm onSubmit={submitHead} requestData={summary} initialData={{ jina: getUserDisplayName(user), cheo: user?.role || '' }} />
    }

    if (role === 'afisa-usafirishaji' && request.status === 'PENDING_TRANSPORT_APPROVAL') {
      return <SectionCForm onSubmit={submitTransport} requestData={summary} initialData={{ cheo: user?.role || '' }} />
    }

    if (role === 'ada-dahrm' && request.status === 'PENDING_DA_APPROVAL') {
      return <SectionDForm onSubmit={submitAda} requestData={summary} initialData={{ cheo: user?.role || '' }} />
    }

    if (role === 'ununuzi-ugavi' && request.status === 'PENDING_FUEL_ISSUANCE') {
      return <SectionEForm onSubmit={submitIssue} requestData={{ ...summary, requestNumber: request.requestNumber }} initialData={{ cheo: user?.role || '', jina: getUserDisplayName(user) }} />
    }

    return null
  }

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={{ name: getUserDisplayName(user), role: user?.role || '' }} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-center gap-4">
              <Link href={user ? roleToDashboard(user.role) : '/dashboard'} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{request?.requestNumber || 'Ombi'}</h1>
                {request && <StatusBadge status={normalizeStatus(request.status)} />}
              </div>
            </div>

            {loading && !request ? (
              <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
            ) : error || !request || !summary ? (
              <div className="rounded-xl border border-danger-200 bg-danger-50 p-6 text-danger-700 dark:border-danger-900/40 dark:bg-danger-900/20 dark:text-danger-300">
                {error || 'Ombi halijapatikana.'}
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                <section className="space-y-6 lg:col-span-2">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                      <FileText className="h-5 w-5 text-primary-500" />
                      Maelezo ya Ombi
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { label: 'Mwombaji', value: summary.applicant, icon: User },
                        { label: 'Idara', value: summary.department, icon: Building },
                        { label: 'Gari Number', value: summary.vehicleNumber, icon: Car },
                        { label: 'Mafuta', value: `${summary.fuelType} - ${summary.litres}L`, icon: Fuel },
                        { label: 'GPSA', value: request.gpsa || request.vehicle?.gpsa || 'N/A', icon: MapPin },
                        { label: 'Tarehe', value: new Date(request.createdAt).toLocaleDateString('sw-TZ'), icon: Calendar },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                          <p className="mt-1 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                            <item.icon className="h-4 w-4 text-gray-400" />
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 border-t border-gray-200 pt-5 dark:border-gray-800">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Kwa ajili ya</p>
                      <p className="mt-1 text-gray-900 dark:text-white">{request.purpose}</p>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-4 border-t border-gray-200 pt-5 dark:border-gray-800">
                      {[
                        ['Km za kuanzia', request.kmFrom],
                        ['Km za sasa', request.kmTo],
                        ['Km zilizotumika', request.kmUsed],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                          <p className="mt-1 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                            <Gauge className="h-4 w-4 text-gray-400" />
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {actionError && (
                    <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-900/40 dark:bg-danger-900/20 dark:text-danger-300">
                      {actionError}
                    </div>
                  )}

                  {renderAction() && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Hatua Yako</h2>
                      {renderAction()}
                    </div>
                  )}
                </section>

                <aside className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Mwendo wa Ombi</h2>
                  <RequestTimeline steps={timeline(request)} />
                </aside>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
