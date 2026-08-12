'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Car, Briefcase, Calendar, Edit3, Fuel } from 'lucide-react'

interface SectionDData {
  naridhia: boolean
  lita: number
  gariNumber: string
  cheo: string
  saini: string
  tarehe: string
}

interface SectionDFormProps {
  onSubmit: (data: SectionDData) => void
  requestData?: {
    applicant: string
    department: string
    litres: number
    fuelType: string
    vehicleNumber: string
  }
  initialData?: Partial<SectionDData>
}

export function SectionDForm({ onSubmit, requestData, initialData }: SectionDFormProps) {
  const [formData, setFormData] = useState<SectionDData>({
    naridhia: initialData?.naridhia ?? true,
    lita: initialData?.lita || requestData?.litres || 0,
    gariNumber: initialData?.gariNumber || requestData?.vehicleNumber || '',
    cheo: initialData?.cheo || '',
    saini: initialData?.saini || '',
    tarehe: initialData?.tarehe || new Date().toISOString().split('T')[0],
  })

  const isRejected = !formData.naridhia

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Request Summary */}
      {requestData && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Muhtasari wa Ombi</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Mwombaji</p>
              <p className="font-medium text-gray-900 dark:text-white">{requestData.applicant}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Idara</p>
              <p className="font-medium text-gray-900 dark:text-white">{requestData.department}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Mafuta</p>
              <p className="font-medium text-gray-900 dark:text-white">{requestData.litres}L {requestData.fuelType}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Gari</p>
              <p className="font-medium text-gray-900 dark:text-white">{requestData.vehicleNumber}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Naridhia/Siridhii */}
        <div>
          <label className="input-label">Uamuzi</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, naridhia: true })}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                formData.naridhia
                  ? 'border-success-500 bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Naridhia
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, naridhia: false })}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                !formData.naridhia
                  ? 'border-danger-500 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
              }`}
            >
              <XCircle className="w-4 h-4" />
              Siridhii
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
              required
              disabled={isRejected}
            />
          </div>
        </div>

        {/* Gari Number */}
        <div>
          <label className="input-label">Gari Number</label>
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.gariNumber}
              onChange={(e) => setFormData({ ...formData, gariNumber: e.target.value })}
              className="input-field pl-10"
              placeholder="T 123 ABC"
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

        {/* Saini */}
        <div>
          <label className="input-label">Saini</label>
          <div className="relative">
            <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.saini}
              onChange={(e) => setFormData({ ...formData, saini: e.target.value })}
              className="input-field pl-10"
              placeholder="Weka saini yako"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          type="submit"
          className={`px-8 py-3 text-base rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 ${
            formData.naridhia
              ? 'btn-success'
              : 'btn-danger'
          }`}
        >
          {formData.naridhia ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Idhinisha
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5" />
              Kataa
            </>
          )}
        </button>
      </div>
    </form>
  )
}