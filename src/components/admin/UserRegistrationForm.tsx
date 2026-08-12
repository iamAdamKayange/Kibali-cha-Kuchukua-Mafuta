'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Briefcase, Building, Phone, CheckCircle, XCircle } from 'lucide-react'

const roles = [
  'Mwombaji/Dereva',
  'Mkuu wa Idara/Kitengo',
  'Afisa Usafirishaji',
  'ADA/DAHRM',
  'Ununuzi na Ugavi',
]

interface UserRegistrationFormProps {
  onSubmit: (data: any) => void
}

export function UserRegistrationForm({ onSubmit }: UserRegistrationFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    role: '',
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    onSubmit(formData)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label className="input-label">Jina la Kwanza</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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

        {/* Last Name */}
        <div>
          <label className="input-label">Jina la Mwisho</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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

        {/* Email */}
        <div>
          <label className="input-label">Barua Pepe</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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

        {/* Password */}
        <div>
          <label className="input-label">Nenosiri</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field pl-10"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="input-label">Simu</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field pl-10"
              placeholder="0712 345 678"
              required
            />
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="input-label">Idara</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="input-field pl-10 appearance-none"
              required
            >
              <option value="">Chagua Idara</option>
              <option value="Habari">Habari</option>
              <option value="Utamaduni">Utamaduni</option>
              <option value="Sanaa">Sanaa</option>
              <option value="Michezo">Michezo</option>
              <option value="Usafirishaji">Usafirishaji</option>
              <option value="ADA">ADA</option>
              <option value="DAHRM">DAHRM</option>
            </select>
          </div>
        </div>

        {/* Role */}
        <div className="md:col-span-2">
          <label className="input-label">Jukumu</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-field pl-10 appearance-none"
              required
            >
              <option value="">Chagua Jukumu</option>
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-8 py-3 text-base flex items-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Sajili Mtumiaji
            </>
          )}
        </button>
      </div>
    </form>
  )
}