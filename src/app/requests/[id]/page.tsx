'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Building, Calendar, Car, CheckCircle, FileText, Fuel, Gauge, MapPin, Printer, User, XCircle } from 'lucide-react'
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
import { formatTanzaniaDateTime, formatTanzaniaDate } from '@/lib/dates'
import { useRequests } from '@/hooks/useRequests'
import { api } from '@/lib/api'
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
  rejectionDetails?: {
    rejectedBy: string
    rejectedByUser: string
    reason: string
    rejectedAt: string | Date
  }
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
  if (status === 'FULLY_APPROVED') return 'approved'
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
    { key: 'ada', label: 'Idhini ya ADA (Final)' },
    { key: 'fully_approved', label: 'Idhini Kamili' },
    { key: 'issue', label: 'Utoaji wa Mafuta' },
  ]

  return labels.map((item, index) => {
    if (item.key === 'submitted') {
        return {
          label: item.label,
          status: 'completed' as const,
          user: applicantName(request),
          date: formatTanzaniaDateTime(request.createdAt),
        }
    }

    if (item.key === 'fully_approved') {
      if (request.status === 'FULLY_APPROVED' || request.status === 'COMPLETED') {
        return {
          label: item.label,
          status: 'completed' as const,
          user: request.finalApproverId ? 'Final Approver' : 'N/A',
          date: request.finalApprovedAt ? formatTanzaniaDateTime(request.finalApprovedAt) : undefined,
        }
      }
      return {
        label: item.label,
        status: 'pending' as const,
      }
    }

    const approval = request.approvals?.find((entry) => entry.stage?.toLowerCase().includes(item.key))
    if (approval) {
      return {
        label: item.label,
        status: approval.approved ? 'completed' as const : 'rejected' as const,
        user: [approval.approver?.firstName, approval.approver?.lastName].filter(Boolean).join(' ') || approval.approver?.email,
        date: approval.approvedAt ? formatTanzaniaDateTime(approval.approvedAt) : undefined,
        reason: approval.reason || undefined,
      }
    }

    const currentByStatus: Record<string, string> = {
      PENDING_HEAD_APPROVAL: 'head',
      PENDING_TRANSPORT_APPROVAL: 'transport',
      PENDING_DA_APPROVAL: 'ada',
      FULLY_APPROVED: 'fully_approved',
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
  const [actionLoading, setActionLoading] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)
  const [canPrint, setCanPrint] = useState(false)
  const [printPermissionReason, setPrintPermissionReason] = useState<string | null>(null)
  const [printLoading, setPrintLoading] = useState(false)
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

  // Check print permissions when request or user changes
  useEffect(() => {
    if (request && user) {
      checkPrintPermission()
    }
  }, [request, user])

  const checkPrintPermission = async () => {
    try {
      const response = await api.checkPrintPermission(id)
      if (response.success && response.data) {
        setCanPrint(response.data.canPrint)
        setPrintPermissionReason(response.data.reason)
      }
    } catch (error) {
      console.error('Failed to check print permission:', error)
      setCanPrint(false)
      setPrintPermissionReason('Failed to check print permission')
    }
  }

  const handlePrintPermit = async () => {
    setPrintLoading(true)
    try {
      const response = await api.generateFuelPermit(id)
      if (response.success && response.data) {
        // Open print dialog with document data
        printDocument(response.data, 'FUEL_PERMIT')
        setSuccessToast('Fuel Permit imetengenezwa kwa ajili ya kuchapisha!')
      } else {
        setActionError(response.error || 'Imeshindikana kutengeneza Fuel Permit. Tafadhali jaribu tena.')
      }
    } catch (error: any) {
      setActionError(error.message || 'Imeshindikana kutengeneza Fuel Permit. Tafadhali jaribu tena.')
    } finally {
      setPrintLoading(false)
    }
  }

  const handlePrintStatement = async () => {
    setPrintLoading(true)
    try {
      const response = await api.generateFuelStatement(id)
      if (response.success && response.data) {
        // Open print dialog with document data
        printDocument(response.data, 'FUEL_STATEMENT')
        setSuccessToast('Fuel Statement imetengenezwa kwa ajili ya kuchapisha!')
      } else {
        setActionError(response.error || 'Imeshindikana kutengeneza Fuel Statement. Tafadhali jaribu tena.')
      }
    } catch (error: any) {
      setActionError(error.message || 'Imeshindikana kutengeneza Fuel Statement. Tafadhali jaribu tena.')
    } finally {
      setPrintLoading(false)
    }
  }

  const printDocument = (data: any, documentType: string) => {
    // Create a simple HTML document for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const title = documentType === 'FUEL_PERMIT' ? 'FUEL PERMIT - KIBALI CHA KUCHUKUA MAFUTA' : 'FUEL STATEMENT - TAARIFA YA MAFUTA'
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0; color: #666; }
          .section { margin-bottom: 20px; }
          .section h2 { background: #f0f0f0; padding: 10px; margin: 0 0 10px 0; font-size: 16px; }
          .row { display: flex; margin-bottom: 8px; }
          .label { width: 200px; font-weight: bold; }
          .value { flex: 1; }
          .approvals { margin-top: 20px; }
          .approval { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Jamhuri ya Muungano wa Tanzania</p>
          <p>Wizara ya Habari, Utamaduni, Sanaa na Michezo</p>
        </div>
        
        <div class="section">
          <h2>Taarifa ya Ombi</h2>
          <div class="row"><span class="label">Namba ya Ombi:</span><span class="value">${data.requestNumber}</span></div>
          <div class="row"><span class="label">Tarehe:</span><span class="value">${new Date(data.issuedDate || data.generatedDate).toLocaleDateString('sw-TZ')}</span></div>
        </div>

        <div class="section">
          <h2>Maelezo ya Dereva</h2>
          <div class="row"><span class="label">Jina:</span><span class="value">${data.driver?.name || data.driver?.name}</span></div>
          <div class="row"><span class="label">Namba ya Wafanyikazi:</span><span class="value">${data.driver?.employeeNumber}</span></div>
          <div class="row"><span class="label">Barua Pepe:</span><span class="value">${data.driver?.email}</span></div>
        </div>

        <div class="section">
          <h2>Idara</h2>
          <div class="row"><span class="label">Jina la Idara:</span><span class="value">${data.department?.name}</span></div>
        </div>

        <div class="section">
          <h2 Maelezo ya Gari</h2>
          <div class="row"><span class="label">Namba ya Gari:</span><span class="value">${data.vehicle?.number}</span></div>
          <div class="row"><span class="label">GPSA:</span><span class="value">${data.vehicle?.gpsa}</span></div>
          <div class="row"><span class="label">Aina ya Mafuta:</span><span class="value">${data.vehicle?.fuelType || data.fuel?.type || data.request?.fuelType}</span></div>
        </div>

        ${documentType === 'FUEL_PERMIT' ? `
        <div class="section">
          <h2>Maelezo ya Mafuta</h2>
          <div class="row"><span class="label">Aina ya Mafuta:</span><span class="value">${data.fuel?.type}</span></div>
          <div class="row"><span class="label">Kiasi Ambacho Kimoombwa:</span><span class="value">${data.fuel?.requestedLitres} Litres</span></div>
          <div class="row"><span class="label">Kiasi Ambacho Kidhinishwa:</span><span class="value">${data.fuel?.approvedLitres} Litres</span></div>
        </div>

        <div class="section">
          <h2>Safari</h2>
          <div class="row"><span class="label">Kwa ajili ya:</span><span class="value">${data.journey?.purpose}</span></div>
          <div class="row"><span class="label">Km za Kuanzia:</span><span class="value">${data.journey?.kmFrom}</span></div>
          <div class="row"><span class="label">Km za Sasa:</span><span class="value">${data.journey?.kmTo}</span></div>
          <div class="row"><span class="label">Km Zilizotumika:</span><span class="value">${data.journey?.kmUsed}</span></div>
        </div>
        ` : `
        <div class="section">
          <h2>Maelezo ya Ombi la Mafuta</h2>
          <div class="row"><span class="label">Aina ya Mafuta:</span><span class="value">${data.request?.fuelType}</span></div>
          <div class="row"><span class="label">Kiasi Ambacho Kimoombwa:</span><span class="value">${data.request?.requestedLitres} Litres</span></div>
          <div class="row"><span class="label">Kiasi Ambacho Kidhinishwa:</span><span class="value">${data.request?.approvedLitres} Litres</span></div>
          <div class="row"><span class="label">Kiasi Ambacho Chatolewa:</span><span class="value">${data.request?.issuedLitres || 'Hajachotolewa'} Litres</span></div>
          <div class="row"><span class="label">Tarehe ya Ombi:</span><span class="value">${new Date(data.request?.requestDate).toLocaleDateString('sw-TZ')}</span></div>
          <div class="row"><span class="label">Tarehe ya Idhini ya Mwisho:</span><span class="value">${data.request?.finalApprovedAt ? new Date(data.request?.finalApprovedAt).toLocaleDateString('sw-TZ') : 'N/A'}</span></div>
        </div>

        <div class="section">
          <h2>Safari</h2>
          <div class="row"><span class="label">Km za Kuanzia:</span><span class="value">${data.journey?.kmFrom}</span></div>
          <div class="row"><span class="label">Km za Sasa:</span><span class="value">${data.journey?.kmTo}</span></div>
          <div class="row"><span class="label">Km Zilizotumika:</span><span class="value">${data.journey?.kmUsed}</span></div>
        </div>

        ${data.issuance ? `
        <div class="section">
          <h2>Utoaji wa Mafuta</h2>
          <div class="row"><span class="label">Mtoaji:</span><span class="value">${data.issuance.issuedBy}</span></div>
          <div class="row"><span class="label">Cheo:</span><span class="value">${data.issuance.designation}</span></div>
          <div class="row"><span class="label">Kiasi Ambacho Chatolewa:</span><span class="value">${data.issuance.litresIssued} Litres</span></div>
          <div class="row"><span class="label">Namba ya Token:</span><span class="value">${data.issuance.tokenNumber}</span></div>
          <div class="row"><span class="label">Tarehe ya Utoaji:</span><span class="value">${new Date(data.issuance.issuedAt).toLocaleDateString('sw-TZ')}</span></div>
        </div>
        ` : ''}
        `}

        ${data.approvals && data.approvals.length > 0 ? `
        <div class="approvals">
          <h2>Idhini Zilizotolewa</h2>
          ${data.approvals.map((approval: any) => `
            <div class="approval">
              <div class="row"><span class="label">Hatua:</span><span class="value">${approval.stage}</span></div>
              <div class="row"><span class="label">Idhinishwa na:</span><span class="value">${approval.approver}</span></div>
              <div class="row"><span class="label">Cheo:</span><span class="value">${approval.designation}</span></div>
              <div class="row"><span class="label">Tarehe:</span><span class="value">${new Date(approval.approvedAt).toLocaleDateString('sw-TZ')}</span></div>
              ${approval.litresApproved ? `<div class="row"><span class="label">Lita Zilizoidhinishwa:</span><span class="value">${approval.litresApproved} Litres</span></div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${data.finalApprover ? `
        <div class="section">
          <h2>Idhinishaji wa Mwisho</h2>
          <div class="row"><span class="label">Jina:</span><span class="value">${data.finalApprover.name}</span></div>
          <div class="row"><span class="label">Cheo:</span><span class="value">${data.finalApprover.designation}</span></div>
        </div>
        ` : ''}

        <div class="footer">
          <p>Hiki ni hatari rasmi ya mfumo wa Kibali cha Kuchukua Mafuta</p>
          <p>Imetengenezwa mnamo: ${new Date().toLocaleString('sw-TZ')}</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

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
  setActionLoading(true)

  try {
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
      setSuccessToast(data.idhini === 'naridhia' ? 'Ombi limeidhinishwa kikamilifu!' : 'Ombi limekataliwa.')
      await afterAction()
    } else {
      setActionError('Action failed. Please check the reason/designation and try again.')
    }
  } finally {
    setActionLoading(false)
  }
}

const submitTransport = async (data: SectionCData) => {
  setActionError('')
  setActionLoading(true)

  try {
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
      setSuccessToast(data.apewe ? 'Ukaguzi wa usafirishaji umekamilika!' : 'Ombi limekataliwa.')
      await afterAction()
    } else {
      setActionError('Action failed. Please check the required fields and try again.')
    }
  } finally {
    setActionLoading(false)
  }
}

const submitAda = async (data: SectionDData) => {
  setActionError('')
  setActionLoading(true)

  try {
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
      setSuccessToast(data.naridhia ? 'Idhini ya ADA imetolewa kikamilifu!' : 'Ombi limekataliwa na ADA.')
      await afterAction()
    } else {
      setActionError('Action failed. Please check the required fields and try again.')
    }
  } finally {
    setActionLoading(false)
  }
}

  const submitIssue = async (data: SectionEData) => {
    setActionError('')
    setActionLoading(true)

    try {
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
      if (result) {
        setSuccessToast('Mafuta yametolewa kikamilifu! Token number imehifadhiwa.')
        await afterAction()
      } else {
        setActionError('Fuel issuance failed. Please check token number and designation.')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const renderAction = () => {
    if (!request || !summary) return null
    if (!stage && role !== 'ununuzi-ugavi') return null

    if (role === 'mkuu-idara' && request.status === 'PENDING_HEAD_APPROVAL') {
      return <SectionBForm onSubmit={submitHead} loading={actionLoading} requestData={summary} initialData={{ jina: getUserDisplayName(user), cheo: user?.role || '' }} />
    }

    if (role === 'afisa-usafirishaji' && request.status === 'PENDING_TRANSPORT_APPROVAL') {
      return <SectionCForm onSubmit={submitTransport} loading={actionLoading} requestData={summary} initialData={{ cheo: user?.role || '' }} />
    }

    if (role === 'ada-dahrm' && request.status === 'PENDING_DA_APPROVAL') {
      return <SectionDForm onSubmit={submitAda} loading={actionLoading} requestData={summary} initialData={{ cheo: user?.role || '' }} />
    }

    if (role === 'ununuzi-ugavi' && (request.status === 'PENDING_FUEL_ISSUANCE' || request.status === 'FULLY_APPROVED')) {
      return <SectionEForm onSubmit={submitIssue} loading={actionLoading} requestData={{ ...summary, requestNumber: request.requestNumber }} initialData={{ cheo: user?.role || '', jina: getUserDisplayName(user) }} />
    }

    return null
  }

  const renderPrintOptions = () => {
    if (!request || !user) return null
    
    // Only show print options if request is fully approved and user is the final approver
    if (request.status !== 'FULLY_APPROVED') return null
    if (!canPrint) return null

    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Printer className="h-5 w-5 text-primary-500" />
          Chapisha Vibali Rasmi
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <button
            onClick={handlePrintPermit}
            disabled={printLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Printer className="h-4 w-4" />
            {printLoading ? 'Inatengenezwa...' : 'Chapisha Fuel Permit'}
          </button>
          <button
            onClick={handlePrintStatement}
            disabled={printLoading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Printer className="h-4 w-4" />
            {printLoading ? 'Inatengenezwa...' : 'Chapisha Fuel Statement'}
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          *Huu ni ukurasa rasmi wa serikali. Usichapishi nakala za uwongo.
        </p>
      </div>
    )
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
                        { label: 'Tarehe', value: formatTanzaniaDate(request.createdAt), icon: Calendar },
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

                  {request.rejectionDetails && (
                    <div className="rounded-2xl border border-danger-200 bg-danger-50 p-6 dark:border-danger-900/40 dark:bg-danger-900/20">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-danger-900 dark:text-danger-100">
                        <XCircle className="h-5 w-5 text-danger-600 dark:text-danger-400" />
                        Ombi Limekataliwa
                      </h2>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-danger-700 dark:text-danger-300">Imekataliwa na:</p>
                          <p className="mt-1 font-medium text-danger-900 dark:text-danger-100">{request.rejectionDetails.rejectedBy}</p>
                        </div>
                        <div>
                          <p className="text-sm text-danger-700 dark:text-danger-300">Idhinishaji:</p>
                          <p className="mt-1 font-medium text-danger-900 dark:text-danger-100">{request.rejectionDetails.rejectedByUser}</p>
                        </div>
                        <div>
                          <p className="text-sm text-danger-700 dark:text-danger-300">Sababu ya kukataliwa:</p>
                          <p className="mt-1 font-medium text-danger-900 dark:text-danger-100">{request.rejectionDetails.reason}</p>
                        </div>
                        <div>
                          <p className="text-sm text-danger-700 dark:text-danger-300">Tarehe ya kukataliwa:</p>
                          <p className="mt-1 font-medium text-danger-900 dark:text-danger-100">{formatTanzaniaDateTime(request.rejectionDetails.rejectedAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}

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

                  {renderPrintOptions()}
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

      {/* Success Toast Popup */}
      {successToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-success-200 dark:border-success-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/30">
              <CheckCircle className="h-8 w-8 text-success-600 dark:text-success-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Imekamilika!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">{successToast}</p>
            <button
              onClick={() => setSuccessToast(null)}
              className="btn-primary px-6 py-2.5 text-sm w-full"
            >
              Sawa
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
