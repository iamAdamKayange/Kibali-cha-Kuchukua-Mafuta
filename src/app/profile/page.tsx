'use client'

import { FormEvent, useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Building, Camera, KeyRound, Mail, Phone, Save, Shield, User, X } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/common/Header'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Sidebar } from '@/components/common/Sidebar'
import { Toast } from '@/components/common/Toast'
import { getUserDepartmentName, getUserDisplayName, roleToDashboard, useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
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

function roleLabel(role?: string, t?: (key: string) => string) {
  if (!t) return role || 'Mwombaji'
  switch (String(role || '').toUpperCase()) {
    case 'ADMIN':
      return t('role_admin')
    case 'DRIVER':
    case 'MWOMBAJI':
      return t('role_driver')
    case 'HEAD_OF_DEPARTMENT':
      return t('role_mkuu_idara')
    case 'TRANSPORT_OFFICER':
      return t('role_afisa_usafirishaji')
    case 'ADA_DAHRM':
      return t('role_ada')
    case 'PROCUREMENT':
      return t('role_procurement')
    default:
      return role || t('role_driver')
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      avatar: (user as any).avatar || '',
    })
    setAvatarPreview((user as any).avatar || '')
  }, [user])

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'Please select an image file' })
      return
    }

    // Increased limit for original image (will be compressed)
    if (file.size > 10 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Image size must be less than 10MB (will be compressed to under 2MB)' })
      return
    }
    
    // Compress and resize the image
    try {
      const compressedImage = await compressImage(file)
      setAvatarPreview(compressedImage)
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to process image. Please try another image.' })
      console.error('Image compression error:', error)
    }
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }

          // Calculate new dimensions (max 300x300 for profile picture)
          const maxDimension = 300
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxDimension) {
              height = (height * maxDimension) / width
              width = maxDimension
            }
          } else {
            if (height > maxDimension) {
              width = (width * maxDimension) / height
              height = maxDimension
            }
          }

          canvas.width = width
          canvas.height = height

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height)

          // Compress to JPEG with quality 0.7 (reasonable quality)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7)
          
          // Verify compressed size is under 2MB
          if (compressedDataUrl.length > 2000000) {
            // If still too large, try lower quality
            const lowerQualityDataUrl = canvas.toDataURL('image/jpeg', 0.5)
            resolve(lowerQualityDataUrl)
          } else {
            resolve(compressedDataUrl)
          }
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleAvatarRemove = () => {
    setAvatarPreview('')
    setProfileForm({ ...profileForm, avatar: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSavingProfile(true)

    const response = await api.put('/users/profile', {
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim() || null,
      avatar: avatarPreview || null,
    })

    setSavingProfile(false)

    if (!response.success) {
      setToast({ type: 'error', message: response.error || 'Profile update failed' })
      return
    }

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data))
      // Force auth context to refresh
      window.location.reload()
    }
    setToast({ type: 'success', message: t('profile_updated') })
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
    setToast({ type: 'success', message: t('password_changed') })
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile_title')}</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  {t('profile_subtitle')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 lg:col-span-1"
              >
                <div className="mx-auto mb-4 relative">
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-primary-500 flex items-center justify-center">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-white">
                        {getUserDisplayName(user).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors"
                    title="Change profile picture"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleAvatarRemove}
                      className="absolute bottom-0 left-0 h-8 w-8 rounded-full bg-danger-500 text-white flex items-center justify-center hover:bg-danger-600 transition-colors"
                      title="Remove profile picture"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
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
                    <span>{roleLabel(user.role, t)}</span>
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
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t('personal_details')}</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="input-label">{t('first_name')}</label>
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
                      <label className="input-label">{t('last_name')}</label>
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
                      <label className="input-label">{t('phone_number')}</label>
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
                      {t('save_profile')}
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
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t('change_password')}</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="input-label">{t('current_password')}</label>
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
                      <label className="input-label">{t('new_password')}</label>
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
                      <label className="input-label">{t('confirm_password')}</label>
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
                      {t('change_password')}
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
