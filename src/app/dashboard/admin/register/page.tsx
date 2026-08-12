'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { UserRegistrationForm } from '@/components/admin/UserRegistrationForm'
import { motion } from 'framer-motion'
import { ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function AdminRegisterPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleSubmit = async (data: any) => {
    console.log('User registered:', data)
    // Show success message or redirect
    router.push('/dashboard/admin')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          user={{ name: 'Msimamizi', role: 'Admin' }}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/dashboard/admin"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Sajili Mtumiaji Mpya
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Jaza fomu hapa chini kuongeza mtumiaji mpya kwenye mfumo
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
                <UserPlus className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Taarifa za Mtumiaji
                </span>
              </div>

              <UserRegistrationForm onSubmit={handleSubmit} />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}