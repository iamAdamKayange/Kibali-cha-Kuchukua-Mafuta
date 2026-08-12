'use client'

import { useState } from 'react'
import { Fuel, Car, BookOpen, Briefcase, Calendar, Edit3, AlertCircle, ArrowRight, XCircle } from 'lucide-react'

interface SectionCData {
  apewe: boolean
  lita: number
  sababu: string
  logbookNamba: string
  to: string
  cheo: string
  saini: string
  tarehe: string
}

interface SectionCFormProps {
  onSubmit: (data: SectionCData) => void
  requestData?: {
    applicant: string
    department: string
    litres: number
    fuelType: string
    vehicleNumber: string
  }
  initialData?: Partial<SectionCData>
}

export function SectionCForm({ onSubmit, requestData, initialData }: SectionCFormProps) {
  const [formData, setFormData] = useState<SectionCData>({
    apewe: initialData?.apewe ?? true,
    lita: initialData?.lita || requestData?.litres || 0,
    sababu: initialData?.sababu || '',
    logbookNamba: initialData?.logbookNamba || '',
    to: initialData?.to || '',
    cheo: initialData?.cheo || '',
    saini: initialData?.saini || 'Confirmed electronically',
    tarehe: initialData?.tarehe || new Date().toISOString().split('T')[0],
  })

  const isRejected = !formData.apewe

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
        {/* Apewe/Asipewe */}
        <div>
          <label className="input-label">Uamuzi</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, apewe: true, sababu: '' })}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                formData.apewe
                  ? 'border-success-500 bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
              }`}
            >
              <Fuel className="w-4 h-4" />
              Apewe
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, apewe: false })}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                !formData.apewe
                  ? 'border-danger-500 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
              }`}
            >
              <XCircle className="w-4 h-4" />
              Asipewe
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
              disabled={isRejected}
            />
          </div>
        </div>

        {/* Sababu */}
        <div className="md:col-span-2">
          <label className="input-label">
            Sababu {isRejected && <span className="text-danger-500">*</span>}
          </label>
          <div className="relative">
            <AlertCircle className={`absolute left-3 top-3 w-5 h-5 ${
              isRejected ? 'text-danger-400' : 'text-gray-400'
            }`} />
            <textarea
              value={formData.sababu}
              onChange={(e) => setFormData({ ...formData, sababu: e.target.value })}
              className="input-field pl-10 min-h-[80px]"
              placeholder={isRejected ? "Andika sababu ya kukataa..." : "Andika sababu (hiari)"}
              required={isRejected}
            />
          </div>
        </div>

        {/* Logbook Namba */}
        <div>
          <label className="input-label">Logbook Namba</label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.logbookNamba}
              onChange={(e) => setFormData({ ...formData, logbookNamba: e.target.value })}
              className="input-field pl-10"
              placeholder="Ingiza logbook namba"
              required
            />
          </div>
        </div>

        {/* To */}
        <div>
          <label className="input-label">To</label>
          <div className="relative">
            <ArrowRight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              className="input-field pl-10"
              placeholder="Ingiza to"
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
            formData.apewe
              ? 'btn-success'
              : 'btn-danger'
          }`}
        >
          {formData.apewe ? (
            <>
              <Fuel className="w-5 h-5" />
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
