'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { motion } from 'framer-motion'
import { Users, UserPlus, Activity, BarChart3, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const stats = [
    { label: 'Watumiaji Wote', value: 45, icon: Users, color: 'text-primary-500' },
    { label: 'Watumiaji Wapya (Mwenzu)', value: 8, icon: UserPlus, color: 'text-success-500' },
    { label: 'Maombi Yote', value: 156, icon: Activity, color: 'text-blue-500' },
    { label: 'Maombi Yanasubiri', value: 12, icon: Clock, color: 'text-warning-500' },
  ]

  const recentActivities = [
    { id: 1, action: 'Mwombaji mpya amesajiliwa', user: 'Admin', time: 'Dakika 5 zilizopita' },
    { id: 2, action: 'Ombi #FR-00241 limewasilishwa', user: 'Adam Mwakyoma', time: 'Saa 1 zilizopita' },
    { id: 3, action: 'Mkuu wa Idara ameidhinisha ombi #FR-00240', user: 'John Doe', time: 'Saa 3 zilizopita' },
    { id: 4, action: 'Mafuta yametolewa kwa ombi #FR-00238', user: 'Ununuzi na Ugavi', time: 'Saa 5 zilizopita' },
  ]

  const roleDistribution = [
    { role: 'Mwombaji/Dereva', count: 18, color: 'bg-blue-500' },
    { role: 'Mkuu wa Idara', count: 8, color: 'bg-green-500' },
    { role: 'Afisa Usafirishaji', count: 6, color: 'bg-yellow-500' },
    { role: 'ADA/DAHRM', count: 7, color: 'bg-purple-500' },
    { role: 'Ununuzi na Ugavi', count: 6, color: 'bg-red-500' },
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          user={{ name: 'Msimamizi', role: 'Admin' }}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashibodi ya Msimamizi
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Hakikisha na usimamizi wa watumiaji na shughuli za mfumo
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Vitendo vya Haraka
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/dashboard/admin/register"
                    className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors duration-200"
                  >
                    <UserPlus className="w-6 h-6 text-primary-500 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Sajili Mtumiaji</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ongeza mtumiaji mpya</p>
                  </Link>
                  <Link
                    href="/dashboard/admin/users"
                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <Users className="w-6 h-6 text-gray-500 dark:text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Watumiaji Wote</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Angalia orodha ya watumiaji</p>
                  </Link>
                  <Link
                    href="/dashboard/admin/reports"
                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <BarChart3 className="w-6 h-6 text-gray-500 dark:text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Taarifa</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Angalia ripoti za mfumo</p>
                  </Link>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl opacity-50">
                    <TrendingUp className="w-6 h-6 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Takwimu</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Inakuja...</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Role Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Mgawanyo wa Majukumu
              </h2>
              <div className="space-y-3">
                {roleDistribution.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{item.role}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${(item.count / 45) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 glass-card rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Shughuli za Hivi Karibuni
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Na: {activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}