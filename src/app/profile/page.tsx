'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Building, KeyRound, Mail, Phone, Save, Shield, User } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/common/Header'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Sidebar } from '@/components/common/Sidebar'
import { Toast } from '@/components/common/Toast'
import { getUserDepartmentName, getUserDisplayName, roleToDashboard, useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

type SidebarRole = 'admin' | 'mwombaji' | 'mkuu-idara' | 'afisa-usafirishaji' | 'ada-dahrm' | 'ununuzi-ugavi'

function roleToSidebarRole(role?: string): SidebarRole {
  const normalized = String(role || '').toUpperCase()
  if (normalized === 'ADMIN') return 'admin'
  if (normalized === 'HEAD_OF_DEPARTMENT') return 'mkuu-idara'
  if (normalized === 'TRANSPORT_OFFICER') return 'afisa-usafirishaji'
  if (normalized === 'ADA_DAHRM') return 'ada-dahrm'
  if (normalized === 'PROCUREMENT') return 'ununuzi-ugavi'
  return 'mwombaji'
}

function roleLabel(role?: string) {
  switch (String(role || '').toUpperCase()) {
    case 'ADMIN':
      return 'Msimamizi'
    case 'DRIVER':
    case 'MWOMBAJI':
      return 'Mwombaji/Dereva'
    case 'HEAD_OF_DEPARTMENT':
      return 'Mkuu wa Idara'
    case 'TRANSPORT_OFFICER':
      return 'Afisa Usafirishaji'
    case 'ADA_DAHRM':
      return 'ADA'
    case 'PROCUREMENT':
      return 'Ununuzi na Ugavi'
    default:
      return role || 'Mwombaji'
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const sidebarRole = useMemo(() => roleToSidebarRole(user?.role), [user?.role])
  const dashboardHref = user ? roleToDashboard(user.role) : '/login'

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [authLoading, router, user])

  useEffect(() => {
    if (!user) return
    setProfileForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: (user as any).phone || '',
    })
  }, [user])

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSavingProfile(true)

    const response = await api.put('/users/profile', {
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim() || null,
    })

    setSavingProfile(false)

    if (!response.success) {
      setToast({ type: 'error', message: response.error || 'Profile update failed' })
      return
    }

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    setToast({ type: 'success', message: 'Profile updated successfully. Please refresh if the header still shows old details.' })
  }

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ type: 'error', message: 'New password and confirmation do not match.' })
      return
    }

    setChangingPassword(true)
    const response = await api.post('/users/change-password', passwordForm)
    setChangingPassword(false)

    if (!response.success) {
      setToast({ type: 'error', message: response.error || 'Password change failed' })
      return
    }

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setToast({ type: 'success', message: 'Password changed successfully.' })
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-transparent">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <Sidebar role={sidebarRole} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={{ name: getUserDisplayName(user), role: user.role }}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex items-center gap-4">
              <Link
                href={dashboardHref}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  Update your account details and change your password.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 lg:col-span-1"
              >
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-500 text-3xl font-bold text-white">
                  {getUserDisplayName(user).charAt(0).toUpperCase()}
                </div>
                <h2 className="text-center text-lg font-semibold text-gray-900 dark:text-white">
                  {getUserDisplayName(user)}
                </h2>
                {user.title && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">{user.title}</p>
                )}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">{user.email}</p>

                <div className="mt-6 space-y-3 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-900/60">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Shield className="h-4 w-4 text-primary-500" />
                    <span>{roleLabel(user.role)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Building className="h-4 w-4 text-primary-500" />
                    <span>{getUserDepartmentName(user) || 'No department'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <User className="h-4 w-4 text-primary-500" />
                    <span>{user.employeeNumber || '-'}</span>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-6 lg:col-span-2">
                <motion.form
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleProfileSubmit}
                  className="glass-card rounded-2xl p-6"
                >
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Personal details</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="input-label">First name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          value={profileForm.firstName}
                          onChange={(event) => setProfileForm({ ...profileForm, firstName: event.target.value })}
                          className="input-field pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Last name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          value={profileForm.lastName}
                          onChange={(event) => setProfileForm({ ...profileForm, lastName: event.target.value })}
                          className="input-field pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })}
                          className="input-field pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          value={profileForm.phone}
                          onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })}
                          className="input-field pl-10"
                          placeholder="+255..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end border-t border-gray-200 pt-4 dark:border-gray-800">
                    <button type="submit" disabled={savingProfile} className="btn-primary flex items-center gap-2 px-6 py-3">
                      {savingProfile ? <LoadingSpinner size="sm" /> : <Save className="h-5 w-5" />}
                      Save profile
                    </button>
                  </div>
                </motion.form>

                <motion.form
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  onSubmit={handlePasswordSubmit}
                  className="glass-card rounded-2xl p-6"
                >
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Change password</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="input-label">Current password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                          className="input-field pl-10"
                          minLength={6}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="input-label">New password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                          className="input-field pl-10"
                          minLength={6}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Confirm password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                          className="input-field pl-10"
                          minLength={6}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end border-t border-gray-200 pt-4 dark:border-gray-800">
                    <button type="submit" disabled={changingPassword} className="btn-primary flex items-center gap-2 px-6 py-3">
                      {changingPassword ? <LoadingSpinner size="sm" /> : <KeyRound className="h-5 w-5" />}
                      Change password
                    </button>
                  </div>
                </motion.form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
