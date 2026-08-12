'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { StatusBadge } from '@/components/common/StatusBadge'
import { RequestTimeline } from '@/components/requests/RequestTimeline'
import { SectionBForm } from '@/components/forms/SectionBForm'
import { SectionCForm } from '@/components/forms/SectionCForm'
import { SectionDForm } from '@/components/forms/SectionDForm'
import { SectionEForm } from '@/components/forms/SectionEForm'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Fuel, 
  Car, 
  User, 
  Building, 
  Calendar, 
  MapPin, 
  Gauge, 
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Printer,
  Share2,
  Download
} from 'lucide-react'
import Link from 'next/link'

type ApprovalRole = 'mkuu-idara' | 'afisa-usafirishaji' | 'ada-dahrm' | 'ununuzi-ugavi'

const getCurrentUserRole = (): ApprovalRole => 'mkuu-idara'

// Mock data - in real app, fetch from API
const getMockRequest = (id: string) => {
  return {
    id,
    requestNumber: '#FR-00241',
    applicant: 'Adam Mwakyoma',
    applicantId: 'user-001',
    department: 'Usafirishaji',
    fuelType: 'Diesel' as const,
    litres: 80,
    vehicleNumber: 'T 123 ABC',
    gpsa: 'GPSA-2026-001',
    purpose: 'Safari ya kikazi kwenda Dodoma kwa ajili ya mikutano ya idara',
    kmFrom: 12450,
    kmTo: 12530,
    kmUsed: 80,
    lastFuelReceived: 40,
    date: '2026-08-11',
    signature: 'Adam Mwakyoma',
    status: 'pending' as const,
    currentStage: 'mkuu-idara' as const,
    createdAt: '2026-08-11T10:19:26',
    updatedAt: '2026-08-11T10:19:26',
    sectionB: {
      approved: true,
      reason: 'Ombi lina mantiki na ni kwa ajili ya kazi',
      name: 'Dr. John Mwakyoma',
      title: 'Mkuu wa Idara ya Usafirishaji',
      signature: 'Dr. John Mwakyoma',
      date: '2026-08-11T12:30:00',
    },
    // sectionC: undefined // pending
  }
}

const timelineSteps = [
  {
    label: 'Ombi Limewasilishwa',
    status: 'completed' as const,
    user: 'Adam Mwakyoma',
    date: '2026-08-11 10:19 AM',
  },
  {
    label: 'Idhini ya Mkuu wa Idara',
    status: 'completed' as const,
    user: 'Dr. John Mwakyoma',
    date: '2026-08-11 12:30 PM',
  },
  {
    label: 'Idhini ya Afisa Usafirishaji',
    status: 'current' as const,
    user: 'Inasubiri',
  },
  {
    label: 'Idhini ya ADA/DAHRM',
    status: 'pending' as const,
  },
  {
    label: 'Utoaji wa Mafuta',
    status: 'pending' as const,
  },
]

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'details' | 'approvals'>('details')
  
  const request = getMockRequest(id)
  const isMwombaji = true // In real app, get from auth
  const userRole = getCurrentUserRole() // In real app, get from auth

  const renderApprovalForm = () => {
    switch (userRole) {
      case 'mkuu-idara':
        return (
          <SectionBForm 
            onSubmit={(data) => console.log('Section B:', data)}
            requestData={{
              applicant: request.applicant,
              department: request.department,
              litres: request.litres,
              fuelType: request.fuelType,
              vehicleNumber: request.vehicleNumber,
            }}
          />
        )
      case 'afisa-usafirishaji':
        return (
          <SectionCForm 
            onSubmit={(data) => console.log('Section C:', data)}
            requestData={{
              applicant: request.applicant,
              department: request.department,
              litres: request.litres,
              fuelType: request.fuelType,
              vehicleNumber: request.vehicleNumber,
            }}
          />
        )
      case 'ada-dahrm':
        return (
          <SectionDForm 
            onSubmit={(data) => console.log('Section D:', data)}
            requestData={{
              applicant: request.applicant,
              department: request.department,
              litres: request.litres,
              fuelType: request.fuelType,
              vehicleNumber: request.vehicleNumber,
            }}
          />
        )
      case 'ununuzi-ugavi':
        return (
          <SectionEForm 
            onSubmit={(data) => console.log('Section E:', data)}
            requestData={{
              applicant: request.applicant,
              department: request.department,
              litres: request.litres,
              fuelType: request.fuelType,
              vehicleNumber: request.vehicleNumber,
              requestNumber: request.requestNumber,
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar role="mwombaji" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          user={{ name: 'Adam Mwakyoma', role: 'Mwombaji/Dereva' }}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/mwombaji"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </Link>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {request.requestNumber}
                    </h1>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Iliyoundwa: {new Date(request.createdAt).toLocaleString('sw-TZ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                  <Printer className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                  <Share2 className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                  <Download className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Request Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-500" />
                    Maelezo ya Ombi
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Mwombaji</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-gray-400" />
                        {request.applicant}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Idara</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                        <Building className="w-4 h-4 text-gray-400" />
                        {request.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Aina ya Mafuta</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                        <Fuel className="w-4 h-4 text-gray-400" />
                        {request.fuelType} - {request.litres}L
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Gari Number</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                        <Car className="w-4 h-4 text-gray-400" />
                        {request.vehicleNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">GPSA</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {request.gpsa}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tarehe</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(request.date).toLocaleDateString('sw-TZ')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kwa ajili ya</p>
                    <p className="text-gray-900 dark:text-white mt-1">{request.purpose}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Km za kuanzia</p>
                        <p className="font-medium text-gray-900 dark:text-white">{request.kmFrom}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Km za sasa</p>
                        <p className="font-medium text-gray-900 dark:text-white">{request.kmTo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Km zilizotumika</p>
                        <p className="font-medium text-gray-900 dark:text-white">{request.kmUsed}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Saini ya Mwombaji</p>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">{request.signature}</p>
                  </div>
                </motion.div>

                {/* Approvals Tab */}
                {!isMwombaji && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-2xl p-6"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary-500" />
                      Idhini Yako
                    </h2>
                    {renderApprovalForm()}
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Timeline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-500" />
                    Mwendo wa Ombi
                  </h2>
                  <RequestTimeline steps={timelineSteps} />
                </motion.div>

                {/* Section Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card rounded-2xl p-4"
                >
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Hatua za Idhini</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Mwombaji/Dereva</span>
                      <CheckCircle className="w-4 h-4 text-success-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Mkuu wa Idara</span>
                      {request.sectionB ? (
                        <CheckCircle className="w-4 h-4 text-success-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-warning-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Afisa Usafirishaji</span>
                      <Clock className="w-4 h-4 text-warning-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">ADA/DAHRM</span>
                      <Clock className="w-4 h-4 text-warning-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Ununuzi na Ugavi</span>
                      <Clock className="w-4 h-4 text-warning-500" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
