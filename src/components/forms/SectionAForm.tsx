'use client'

import { useEffect, useMemo, useState } from 'react'
import { Fuel, Car, MapPin, User, Building, Hash, Gauge } from 'lucide-react'
import { api } from '@/lib/api'
import { useLanguage } from '@/contexts/LanguageContext'

interface SectionAData {
  vehicleId: string
  fuelType: 'DIESEL' | 'PETROL'
  requestedLitres: number
  purpose: string
  kmFrom: number
  kmTo: number
  lastFuelReceived: number
  applicantConfirmed: boolean
  driverSignature?: string
}

interface SectionAFormProps {
  onSubmit: (data: SectionAData) => void
  initialData?: Partial<SectionAData>
  user?: {
    name: string
    employeeNumber?: string
    department?: string
  }
}

interface VehicleOption {
  id: string
  vehicleNumber: string
  gpsa: string
  fuelType: 'DIESEL' | 'PETROL'
}

export function SectionAForm({ onSubmit, initialData, user }: SectionAFormProps) {
  const { t } = useLanguage()
  const [vehicles, setVehicles] = useState<VehicleOption[]>([])
  const [formData, setFormData] = useState<SectionAData>({
    vehicleId: initialData?.vehicleId || '',
    fuelType: initialData?.fuelType || 'DIESEL',
    requestedLitres: initialData?.requestedLitres || 0,
    purpose: initialData?.purpose || '',
    kmFrom: initialData?.kmFrom || 0,
    kmTo: initialData?.kmTo || 0,
    lastFuelReceived: initialData?.lastFuelReceived || 0,
    applicantConfirmed: initialData?.applicantConfirmed ?? true,
  })

  useEffect(() => {
    api.get<VehicleOption[]>('/vehicles?limit=100&isActive=true').then((response) => {
      if (response.success && response.data) setVehicles(response.data)
    })
  }, [])

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === formData.vehicleId)
  const kmUsed = useMemo(() => Math.max(formData.kmTo - formData.kmFrom, 0), [formData.kmFrom, formData.kmTo])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      driverSignature: 'Confirmed electronically',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-primary-100 bg-primary-50/70 p-4 dark:border-primary-900/40 dark:bg-primary-900/10">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('driver')}</p>
          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mt-1">
            <User className="w-4 h-4 text-primary-500" />
            {user?.name || t('yourAccount')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('department')}</p>
          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mt-1">
            <Building className="w-4 h-4 text-primary-500" />
            {user?.department || t('fromAccount')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('employeeNumber')}</p>
          <p className="font-medium text-gray-900 dark:text-white mt-1">{user?.employeeNumber || '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fuel Type and Litres */}
        <div>
          <label className="input-label">{t('fuelType')}</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, fuelType: 'DIESEL' })}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                formData.fuelType === 'DIESEL'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
              }`}
            >
              Diesel
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, fuelType: 'PETROL' })}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                formData.fuelType === 'PETROL'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
              }`}
            >
              Petrol
            </button>
          </div>
        </div>

        <div>
          <label className="input-label">{t('litres')}</label>
          <div className="relative">
            <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={formData.requestedLitres}
              onChange={(e) => setFormData({ ...formData, requestedLitres: parseFloat(e.target.value) || 0 })}
              className="input-field pl-10"
              placeholder="0.0"
              min="0"
              step="0.1"
              required
            />
          </div>
        </div>

        <div>
          <label className="input-label">{t('vehicleNumber')}</label>
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              className="input-field pl-10 appearance-none"
              required
            >
              <option value="">{t('chooseVehicle')}</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicleNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* GPSA */}
        <div>
          <label className="input-label">GPSA</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={selectedVehicle?.gpsa || ''}
              className="input-field pl-10"
              placeholder={t('fromVehicle')}
              readOnly
            />
          </div>
        </div>

        {/* Kwa ajili ya */}
        <div className="md:col-span-2">
          <label className="input-label">{t('purpose')}</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="input-field pl-10 min-h-[80px]"
              placeholder={t('purposePlaceholder')}
              required
            />
          </div>
        </div>

        {/* KM */}
        <div>
          <label className="input-label">{t('kmFrom')}</label>
          <div className="relative">
            <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={formData.kmFrom}
              onChange={(e) => setFormData({ ...formData, kmFrom: parseFloat(e.target.value) || 0 })}
              className="input-field pl-10"
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <label className="input-label">{t('kmTo')}</label>
          <div className="relative">
            <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={formData.kmTo}
              onChange={(e) => setFormData({ ...formData, kmTo: parseFloat(e.target.value) || 0 })}
              className="input-field pl-10"
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <label className="input-label">{t('kmUsed')}</label>
          <div className="relative">
            <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={kmUsed}
              className="input-field pl-10"
              placeholder="0"
              min="0"
              readOnly
            />
          </div>
        </div>

        {/* Mara ya mwisho */}
        <div>
          <label className="input-label">{t('lastFuelReceived')}</label>
          <div className="relative">
            <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={formData.lastFuelReceived}
              onChange={(e) => setFormData({ ...formData, lastFuelReceived: parseFloat(e.target.value) || 0 })}
              className="input-field pl-10"
              placeholder="0"
              min="0"
              step="0.1"
              required
            />
          </div>
        </div>

        <label className="md:col-span-2 flex items-start gap-3 rounded-xl border border-primary-100 bg-primary-50/70 p-4 text-sm text-gray-700 dark:border-primary-900/40 dark:bg-primary-900/10 dark:text-gray-200">
          <input
            type="checkbox"
            checked={formData.applicantConfirmed}
            onChange={(e) => setFormData({ ...formData, applicantConfirmed: e.target.checked })}
            className="mt-1"
            required
          />
          <span>{t('digitalConfirmApplicant')}</span>
        </label>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
        <button type="submit" className="btn-primary px-8 py-3 text-base">
          {t('submitRequest')}
        </button>
      </div>
    </form>
  )
}
