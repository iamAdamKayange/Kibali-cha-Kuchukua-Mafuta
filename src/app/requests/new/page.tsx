'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { SectionAForm } from '@/components/forms/SectionAForm'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getUserDepartmentName, getUserDisplayName, useAuth } from '@/contexts/AuthContext'
import { useRequests } from '@/hooks/useRequests'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NewRequestPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { createRequest, error } = useRequests({ autoFetch: false })
  const { t } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setLoading(true)
    const request = await createRequest(data)
    setLoading(false)
    if (request) router.push('/dashboard/mwombaji')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar role="mwombaji" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          user={{ name: getUserDisplayName(user), role: 'Mwombaji/Dereva' }}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/dashboard/mwombaji"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('fuelRequestTitle')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {t('fuelRequestSubtitle')}
                </p>
              </div>
            </div>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 md:p-8"
            >
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium">
                  {t('stepOne')}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('sectionAApplicant')}
                </span>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-600 dark:border-danger-900/40 dark:bg-danger-900/20">
                  {error}
                </div>
              )}
              <SectionAForm
                onSubmit={handleSubmit}
                user={{
                  name: getUserDisplayName(user),
                  employeeNumber: user?.employeeNumber,
                  department: getUserDepartmentName(user),
                }}
              />
              {loading && <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t('submittingRequest')}</p>}
            </motion.div>

            {/* Progress */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full" />
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-full" />
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-full" />
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-full" />
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
