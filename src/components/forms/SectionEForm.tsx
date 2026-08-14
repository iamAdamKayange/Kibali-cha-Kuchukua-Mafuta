'use client'

import { useState } from 'react'
import { Fuel, User, Briefcase, Calendar, Hash, CheckCircle } from 'lucide-react'

export interface SectionEData {
  fuelType: 'Diesel' | 'Petrol'
  lita: number
  tokenNumber: string
  jina: string
  cheo: string
  tarehe: string
}

interface SectionEFormProps {
  onSubmit: (data: SectionEData) => void
  requestData?: {
    applicant: string
    department: string
    litres: number
    fuelType: string
    vehicleNumber: string
    requestNumber: string
  }
  initialData?: Partial<SectionEData>
}

export function SectionEForm({ onSubmit, requestData, initialData }: SectionEFormProps) {
  const [formData, setFormData] = useState<SectionEData>({
    fuelType: initialData?.fuelType || (requestData?.fuelType as 'Diesel' | 'Petrol') || 'Diesel',
    lita: initialData?.lita || requestData?.litres || 0,
    tokenNumber: initialData?.tokenNumber || '',
    jina: initialData?.jina || '',
    cheo: initialData?.cheo || '',
    tarehe: initialData?.tarehe || new Date().toISOString().split('T')[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Request Summary */}
      {requestData && (
        <div className="bg-success-50 dark:bg-success-900/20 rounded-xl p-4 border border-success-200 dark:border-success-800">
          <h4 className="text-sm font-medium text-success-700 dark:text-success-300 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Ombi limeidhinishwa - Tolea Mafuta
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Namba ya Ombi</p>
              <p className="font-medium text-gray-900 dark:text-white">{requestData.requestNumber}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Mwombaji</p>
              <p className="font-medium text-gray-900 dark:text-white">{requestData.applicant}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Idara</p>
              <p className="font-medium text-gray-900 dark:text-white">{requestData.department}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Gari</p>
              <p className="font-medium text-gray-900 dark:text-white">{requestData.vehicleNumber}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aina ya Mafuta */}
        <div>
          <label className="input-label">Aina ya Mafuta</label>
          <div className="flex gap-2">
            <button              type="button"
              onClick={() => setFormData({ ...formData, fuelType: 'Diesel' })}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                formData.fuelType === 'Diesel'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
              }`}
            >
              Diesel
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, fuelType: 'Petrol' })}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                formData.fuelType === 'Petrol'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
              }`}
            >
              Petrol
            </button>
          </div>
        </div>

        {/* Lita */}
        <div>
          <label className="input-label">Lita</label>
          <div className="relative">
            <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={formData.lita}
              onChange={(e) => setFormData({ ...formData, lita: parseFloat(e.target.value) || 0 })}
              className="input-field pl-10"
              placeholder="0.0"
              min="0"
              step="0.1"
              readOnly
            />
          </div>
        </div>

        {/* Token Number */}
        <div>
          <label className="input-label">Token Number No.</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.tokenNumber}
              onChange={(e) => setFormData({ ...formData, tokenNumber: e.target.value })}
              className="input-field pl-10"
              placeholder="Ingiza namba ya token"
              required
            />
          </div>
        </div>

        {/* Jina */}
        <div>
          <label className="input-label">Jina</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.jina}
              onChange={(e) => setFormData({ ...formData, jina: e.target.value })}
              className="input-field pl-10"
              placeholder="Ingiza jina lako"
              required
            />
          </div>
        </div>

        {/* Cheo */}
        <div>
          <label className="input-label">Cheo</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.cheo}
              onChange={(e) => setFormData({ ...formData, cheo: e.target.value })}
              className="input-field pl-10"
              placeholder="Ingiza cheo chako"
              required
            />
          </div>
        </div>

        {/* Tarehe */}
        <div>
          <label className="input-label">Tarehe</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.tarehe}
              onChange={(e) => setFormData({ ...formData, tarehe: e.target.value })}
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        <div className="rounded-xl border border-success-100 bg-success-50/70 p-4 text-sm text-gray-700 dark:border-success-900/40 dark:bg-success-900/10 dark:text-gray-200">
          Utoaji huu utahifadhiwa kidigitali pamoja na jina, role, token na tarehe/saa ya mtumiaji aliyeingia.
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          type="submit"
          className="btn-primary px-8 py-3 text-base flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Toa Mafuta
        </button>
      </div>
    </form>
  )
}
