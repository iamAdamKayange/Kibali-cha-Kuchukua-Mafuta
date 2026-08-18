'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Edit3, Search, Trash2, UserPlus, Users, X } from 'lucide-react'
import { Sidebar } from '@/components/common/Sidebar'
import { Header } from '@/components/common/Header'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Toast } from '@/components/common/Toast'
import { api } from '@/lib/api'
import {
  ORGANIZATION_CATEGORIES,
  ORGANIZATION_UNITS,
  getCategoryLabel,
  inferCategoryFromDepartmentName,
  type OrganizationCategory,
} from '@/lib/organization'
import type { User } from '@/types'

interface DepartmentOption {
  id: string
  name: string
  description?: string | null
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Msimamizi',
  DRIVER: 'Mwombaji/Dereva',
  HEAD_OF_DEPARTMENT: 'Mkuu wa Idara/Kitengo',
  TRANSPORT_OFFICER: 'Afisa Usafirishaji',
  ADA_DAHRM: 'ADA',
  PROCUREMENT: 'Ununuzi na Ugavi',
}

const roles = Object.keys(roleLabels)

function departmentName(user: User) {
  const department = user.department
  if (!department) return 'N/A'
  return typeof department === 'string' ? department : department.name
}

function departmentCategory(user: User) {
  const department = user.department
  if (!department || typeof department === 'string') {
    return 'N/A'
  }

  return getCategoryLabel(department.description || inferCategoryFromDepartmentName(department.name))
}

export default function AdminUsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    role: 'DRIVER',
    category: '' as OrganizationCategory | '',
    departmentId: '',
    isActive: true,
    password: '',
  })

  const fetchUsers = async () => {
    setLoading(true)
    const response = await api.get<User[]>('/admin/users?limit=100')
    if (response.success && response.data) setUsers(response.data)
    else setError(response.error || 'Failed to fetch users')
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
    api.get<DepartmentOption[]>('/departments').then((response) => {
      if (response.success && response.data) setDepartments(response.data)
    })
  }, [])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users

    return users.filter((user) =>
        [user.firstName, user.lastName, user.title, user.email, user.phone, user.role, departmentName(user)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [search, users])

  const openEdit = (user: User) => {
    const department = user.department && typeof user.department === 'object' ? user.department : null
    const category = department
      ? inferCategoryFromDepartmentName(department.description || department.name)
      : ''

    setEditingUser(user)
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      title: user.title || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role as string,
      category,
      departmentId: user.departmentId || (typeof user.department === 'object' && user.department ? user.department.id : ''),
      isActive: user.isActive,
      password: '',
    })
  }

  const availableDepartments = useMemo(() => {
    if (!form.category) return departments

    const category = form.category as OrganizationCategory

    return departments.filter((department) => {
      const description = String(department.description || '').trim().toUpperCase()
      if (description) {
        return description === category
      }

      return ORGANIZATION_UNITS[category].includes(department.name.trim().toUpperCase())
    })
  }, [departments, form.category])

  const saveUser = async () => {
    if (!editingUser) return
    setSaving(true)
    const response = await api.patch<User>(`/admin/users/${editingUser.id}`, {
      firstName: form.firstName,
      lastName: form.lastName,
      title: form.title,
      email: form.email,
      phone: form.phone || null,
      role: form.role,
      departmentId: form.departmentId || null,
      isActive: form.isActive,
      password: form.password || undefined,
    })
    setSaving(false)

    if (!response.success || !response.data) {
      setToast({ type: 'error', message: response.error || 'Failed to update user' })
      return
    }

    setUsers((items) => items.map((item) => (item.id === response.data!.id ? response.data! : item)))
    setEditingUser(null)
    setToast({ type: 'success', message: 'User updated successfully.' })
  }

  const deleteUser = async (user: User) => {
    if (!confirm(`Delete or deactivate ${user.email}?`)) return
    const response = await api.delete<{ deleted: boolean; deactivated: boolean; user?: User }>(`/admin/users/${user.id}`)

    if (!response.success) {
      setToast({ type: 'error', message: response.error || 'Failed to delete user' })
      return
    }

    if (response.data?.deleted) {
      setUsers((items) => items.filter((item) => item.id !== user.id))
      setToast({ type: 'success', message: 'User deleted successfully.' })
      return
    }

    if (response.data?.user) {
      setUsers((items) => items.map((item) => (item.id === user.id ? response.data!.user! : item)))
    }
    setToast({ type: 'success', message: 'User has history, so they were deactivated instead.' })
  }

  return (
    <div className="flex h-screen bg-transparent">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={{ name: 'Msimamizi', role: 'Admin' }} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Watumiaji Wote</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Edit, deactivate, or delete users.</p>
            </div>
            <Link href="/dashboard/admin/register" className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-200">
              <UserPlus className="w-5 h-5" />
              Sajili Mtumiaji
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tafuta jina, email, role, au idara..." className="input-field pl-10" />
            </div>
          </div>

          {error && <div className="mb-6 rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-900/40 dark:bg-danger-900/20 dark:text-danger-300">{error}</div>}

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Jina</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Cheo</th>
                      <th className="px-4 py-3 font-medium">Aina</th>
                      <th className="px-4 py-3 font-medium">Idara</th>
                      <th className="px-4 py-3 font-medium">Hali</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="text-gray-700 dark:text-gray-300">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{[user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A'}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{roleLabels[user.role] || user.role}</td>
                        <td className="px-4 py-3">{user.title || 'N/A'}</td>
                        <td className="px-4 py-3">{departmentCategory(user)}</td>
                        <td className="px-4 py-3">{departmentName(user)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.isActive ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(user)} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => deleteUser(user)} className="rounded-lg p-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center"><Users className="w-10 h-10 text-gray-400 mx-auto mb-3" /><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hakuna watumiaji waliopatikana.</h2></div>
            )}
          </div>
        </main>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-950">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit user</h2>
              <button onClick={() => setEditingUser(null)} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input className="input-field" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              <input className="input-field" placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input className="input-field" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="input-field" placeholder="New password (optional)" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {roles.map((role) => <option key={role} value={role}>{roleLabels[role] || role}</option>)}
              </select>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as OrganizationCategory | '', departmentId: '' })}>
                <option value="">Chagua Idara au Kitengo</option>
                {ORGANIZATION_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
              <select className="input-field" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} disabled={!form.category}>
                <option value="">{form.category ? `Chagua ${form.category === 'KITENGO' ? 'Kitengo' : 'Idara'}` : 'Chagua kwanza aina ya muundo'}</option>
                {availableDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditingUser(null)} className="rounded-xl border border-gray-200 px-5 py-3 text-sm dark:border-gray-700 dark:text-gray-200">Cancel</button>
              <button onClick={saveUser} disabled={saving} className="btn-primary px-5 py-3 text-sm">{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
