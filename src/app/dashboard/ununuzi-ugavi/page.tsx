'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { RequestCard } from '@/components/requests/RequestCard'
import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle, XCircle, Fuel, Truck, PlusCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function UnunuziUgaviDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const stats = [
    { label: 'Yanasubiri Kutolewa', value: 3, icon: Clock, color: 'text-warning-500' },
    { label: 'Yametolewa', value: 20, icon: CheckCircle, color: 'text-success-500' },
    { label: 'Yamekataliwa', value: 2, icon: XCircle, color: 'text-danger-500' },
    { label: 'Mafuta Yaliyotolewa', value: 850, icon: Fuel, color: 'text-blue-500' },
  ]

  const pendingRequests = [
    {
      id: '1',
      requestNumber: '#FR-00249',
      applicant: 'Adam Mwakyoma',
      department: 'Usafirishaji',
      fuelType: 'Diesel' as const,
      litres: 80,
      vehicleNumber: 'T 123 ABC',
      status: 'pending' as const,
      date: '2026-08-11',
      currentStage: 'Ununuzi na Ugavi',
    },
    {
      id: '2',
      requestNumber: '#FR-00250',
      applicant: 'David Kato',
      department: 'Utamaduni',
      fuelType: 'Petrol' as const,
      litres: 35,
      vehicleNumber: 'T 678 STU',
      status: 'pending' as const,
      date: '2026-08-11',
      currentStage: 'Ununuzi na Ugavi',
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar role="ununuzi-ugavi" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          user={{ name: 'William Kivuyo', role: 'Ununuzi na Ugavi' }}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashibodi ya Ununuzi na Ugavi
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Toa mafuta kwa maombi yaliyoidhinishwa
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
                Maombi Yanayosubiri Kutolewa
              </h2>
              <Link
                href="/dashboard/ununuzi-ugavi/pending"
                className="text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                Ona yote
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/dashboard/ununuzi-ugavi/pending">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-primary-500/30 flex items-center gap-2"
              >
                <Truck className="w-5 h-5" />
                Toa Mafuta
              </motion.button>
            </Link>
            <Link href="/dashboard/ununuzi-ugavi/history">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Historia ya Utoaji
              </motion.button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}