'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { RequestCard } from '@/components/requests/RequestCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { motion } from 'framer-motion'
import { Fuel, FileText, Clock, CheckCircle, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useRequests } from '@/hooks/useRequests'

// Helper function to check if status is pending
const isPendingStatus = (status: string): boolean => {
  const pendingStatuses = ['pending', 'PENDING', 'submitted', 'SUBMITTED', 'PENDING_HEAD_APPROVAL', 'PENDING_TRANSPORT_APPROVAL', 'PENDING_DA_APPROVAL', 'PENDING_FUEL_ISSUANCE']
  return pendingStatuses.includes(status)
}

// Helper function to check if status is approved
const isApprovedStatus = (status: string): boolean => {
  const approvedStatuses = ['approved', 'APPROVED', 'HEAD_APPROVED', 'TRANSPORT_APPROVED', 'ADA_APPROVED']
  return approvedStatuses.includes(status)
}

// Helper function to get litres
const getLitres = (request: any): number => {
  return request.issuedLitres || request.litres || request.requestedLitres || 0
}

export default function MwombajiDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Use real data from hook
  const { requests, loading, total, refetch } = useRequests({
    autoFetch: true,
    page: 1,
    limit: 10,
  })

  // Calculate stats from real data
  const stats = [
    { 
      label: 'Maombi Yote', 
      value: total, 
      icon: FileText, 
      color: 'text-primary-500' 
    },
    { 
      label: 'Yanasubiri', 
      value: requests.filter(r => isPendingStatus(r.status)).length, 
      icon: Clock, 
      color: 'text-yellow-500' 
    },
    { 
      label: 'Yameidhinishwa', 
      value: requests.filter(r => isApprovedStatus(r.status)).length, 
      icon: CheckCircle, 
      color: 'text-green-500' 
    },
    { 
      label: 'Mafuta Yaliyotolewa', 
      value: requests.reduce((sum, r) => sum + getLitres(r), 0), 
      icon: Fuel, 
      color: 'text-blue-500' 
    },
  ]

  // Recent requests (last 3)
  const recentRequests = requests.slice(0, 3)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar role="mwombaji" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          user={{ name: 'Adam Mwakyoma', role: 'Mwombaji/Dereva' }}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Karibu, Adam
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Hapa unaweza kuomba mafuta na kuangalia maombi yako
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {loading ? '...' : stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Action */}
          <div className="mb-6">
            <Link href="/requests/new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full md:w-auto px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Omba Mafuta
              </motion.button>
            </Link>
          </div>

          {/* Recent Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Maombi yako ya hivi karibuni
              </h2>
              <Link
                href="/dashboard/mwombaji/requests"
                className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                Ona yote →
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : recentRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Hakuna Maombi
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Bado hujafanya ombi lolote la mafuta. Anza kuomba sasa!
                </p>
                <Link href="/requests/new">
                  <button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-primary-500/30">
                    Omba Mafuta
                  </button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}