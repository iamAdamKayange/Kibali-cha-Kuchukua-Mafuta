'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Briefcase,
  Building,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react'
import { api } from '@/lib/api'

const roles = [
  { value: 'DRIVER', label: 'Mwombaji/Dereva' },
  { value: 'HEAD_OF_DEPARTMENT', label: 'Mkuu wa Idara/Kitengo' },
  { value: 'TRANSPORT_OFFICER', label: 'Afisa Usafirishaji' },
  { value: 'ADA_DAHRM', label: 'ADA/DAHRM' },
  { value: 'PROCUREMENT', label: 'Ununuzi na Ugavi' },
]

interface UserRegistrationFormProps {
  onSubmit?: (data: RegisterResult) => void
}

interface Department {
  id: string
  name: string
}

interface RegisterResult {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    employeeNumber: string
  }
  credentials: {
    email: string
    password: string
  }
  email: {
    sent: boolean
    message: string
  }
}

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  departmentId: '',
  role: '',
}

export function UserRegistrationForm({ onSubmit }: UserRegistrationFormProps) {
  const [formData, setFormData] = useState(emptyForm)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<RegisterResult | null>(null)

  const generatedPassword = useMemo(() => {
    const code = Math.random().toString(36).slice(2, 6).toUpperCase()
    return `Kibali@${new Date().getFullYear()}${code}`
  }, [])

  useEffect(() => {
    api.get<Department[]>('/departments').then((response) => {
      if (response.success && response.data) {
        setDepartments(response.data)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const response = await api.post<RegisterResult>('/admin/users', formData)

    if (!response.success || !response.data) {
      setError(response.error || response.message || 'Imeshindikana kusajili mtumiaji.')
      setLoading(false)
      return
    }

    setResult(response.data)
    setFormData(emptyForm)
    onSubmit?.(response.data)
    setLoading(false)
  }

  const copyCredentials = async () => {
    if (!result) return
    await navigator.clipboard.writeText(`Email: ${result.credentials.email}\nPassword: ${result.credentials.password}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-danger-500/20 bg-danger-50 p-4 text-sm text-danger-600 dark:bg-danger-500/10">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-success-500/25 bg-success-50 p-4 dark:bg-success-500/10"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success-600" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">Mtumiaji amesajiliwa kikamilifu</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{result.email.message}</p>
              <div className="mt-3 rounded-xl bg-white/80 p-3 text-sm dark:bg-gray-950/60">
                <p><span className="font-medium">Email:</span> {result.credentials.email}</p>
                <p><span className="font-medium">Password:</span> {result.credentials.password}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={copyCredentials}
              className="tap-target rounded-xl bg-white p-2 text-gray-600 shadow-sm hover:text-primary-600 dark:bg-gray-900 dark:text-gray-300"
              aria-label="Copy credentials"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="input-label">Jina la Kwanza</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="input-field pl-10"
              placeholder="Adam"
              required
            />
          </div>
        </div>

        <div>
          <label className="input-label">Jina la Mwisho</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="input-field pl-10"
              placeholder="Mwakyoma"
              required
            />
          </div>
        </div>

        <div>
          <label className="input-label">Barua Pepe</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field pl-10"
              placeholder="adam@wizara.go.tz"
              required
            />
          </div>
        </div>

        <div>
          <label className="input-label">Nenosiri la Muda</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field pl-10 pr-12"
              placeholder="Weka password"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label={showPassword ? 'Ficha password' : 'Onyesha password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, password: generatedPassword })}
            className="mt-2 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Tumia password salama iliyopendekezwa
          </button>
        </div>

        <div>
          <label className="input-label">Simu</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field pl-10"
              placeholder="0712 345 678"
            />
          </div>
        </div>

        <div>
          <label className="input-label">Idara / Kitengo</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="input-field appearance-none pl-10"
              required
            >
              <option value="">Chagua Idara au Kitengo</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="input-label">Jukumu</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-field appearance-none pl-10"
              required
            >
              <option value="">Chagua Jukumu</option>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-200 pt-4 dark:border-gray-800">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-2 px-8 py-3 text-base disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              Sajili na Tuma Email
            </>
          )}
        </button>
      </div>
    </form>
  )
}
