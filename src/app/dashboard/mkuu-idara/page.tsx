'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { RequestCard } from '@/components/requests/RequestCard'
import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle, XCircle, ListChecks, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function MkuuIdaraDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const stats = [
    { label: 'Yanasubiri Idhini', value: 5, icon: Clock, color: 'text-warning-500' },
    { label: 'Yameidhinishwa', value: 12, icon: CheckCircle, color: 'text-success-500' },
    { label: 'Yamekataliwa', value: 3, icon: XCircle, color: 'text-danger-500' },
    { label: 'Jumla ya Maombi', value: 20, icon: FileText, color: 'text-primary-500' },
  ]

  const pendingRequests = [
    {
      id: '1',
      requestNumber: '#FR-00241',
      applicant: 'Adam Mwakyoma',
      department: 'Usafirishaji',
      fuelType: 'Diesel' as const,
      litres: 80,
      vehicleNumber: 'T 123 ABC',
      status: 'pending' as const,
      date: '2026-08-11',
      currentStage: 'Mkuu wa Idara',
    },
    {
      id: '2',
      requestNumber: '#FR-00242',
      applicant: 'Sarah Juma',
      department: 'Habari',
      fuelType: 'Petrol' as const,
      litres: 40,
      vehicleNumber: 'T 789 XYZ',
      status: 'pending' as const,
      date: '2026-08-11',
      currentStage: 'Mkuu wa Idara',
    },
    {
      id: '3',
      requestNumber: '#FR-00243',
      applicant: 'John Doe',
      department: 'Michezo',
      fuelType: 'Diesel' as const,
      litres: 60,
      vehicleNumber: 'T 456 DEF',
      status: 'pending' as const,
      date: '2026-08-10',
      currentStage: 'Mkuu wa Idara',
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar role="mkuu-idara" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          user={{ name: 'Dr. John Mwakyoma', role: 'Mkuu wa Idara/Kitengo' }}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashibodi ya Mkuu wa Idara
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Kagua na idhinisha au kataa maombi ya mafuta
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
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pending Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning-500" />
                Maombi Yanayosubiri Idhini
              </h2>
              <Link
                href="/dashboard/mkuu-idara/pending"
                className="text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                Ona yote
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>

          {/* Quick Action */}
          <div className="mt-6">
            <Link href="/dashboard/mkuu-idara/pending">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full md:w-auto px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
              >
                <ListChecks className="w-5 h-5" />
                Kagua Maombi Yote
              </motion.button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}