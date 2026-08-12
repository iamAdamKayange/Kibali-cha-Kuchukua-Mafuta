'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, UserPlus, Users } from 'lucide-react'
import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { api } from '@/lib/api'
import type { User } from '@/types'

export default function AdminUsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api
      .get<User[]>('/users')
      .then((response) => {
        if (response.success && response.data) {
          setUsers(response.data)
          return
        }
        setError(response.error || 'Failed to fetch users')
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users

    return users.filter((user) =>
      [user.firstName, user.lastName, user.email, user.phone, user.role, user.department]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [search, users])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={{ name: 'Msimamizi', role: 'Admin' }} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Watumiaji Wote</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Simamia watumiaji waliopo kwenye mfumo.</p>
            </div>
            <Link
              href="/dashboard/admin/register"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-200"
            >
              <UserPlus className="w-5 h-5" />
              Sajili Mtumiaji
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tafuta jina, email, role, au idara..."
                className="input-field pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-900/40 dark:bg-danger-900/20 dark:text-danger-300">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Jina</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Idara</th>
                      <th className="px-4 py-3 font-medium">Hali</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="text-gray-700 dark:text-gray-300">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A'}
                        </td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{user.role}</td>
                        <td className="px-4 py-3">{String(user.department || 'N/A')}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.isActive
                              ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hakuna watumiaji waliopatikana.</h2>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
