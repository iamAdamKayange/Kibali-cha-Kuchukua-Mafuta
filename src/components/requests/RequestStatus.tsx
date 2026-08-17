'use client'

import { motion } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Send,
  Fuel,
  User,
  Building,
  Calendar,
  ArrowRight
} from 'lucide-react'

interface RequestStatusProps {
  requestNumber: string
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'completed'
  currentStage: string
  applicant: string
  department: string
  fuelType: string
  litres: number
  vehicleNumber: string
  date: string
  onViewDetails?: () => void
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Inasubiri',
    color: 'text-warning-500',
    bgColor: 'bg-warning-50 dark:bg-warning-900/20',
    borderColor: 'border-warning-200 dark:border-warning-800',
  },
  submitted: {
    icon: Send,
    label: 'Imewasilishwa',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  approved: {
    icon: CheckCircle,
    label: 'Imeidhinishwa',
    color: 'text-success-500',
    bgColor: 'bg-success-50 dark:bg-success-900/20',
    borderColor: 'border-success-200 dark:border-success-800',
  },
  rejected: {
    icon: XCircle,
    label: 'Imekataliwa',
    color: 'text-danger-500',
    bgColor: 'bg-danger-50 dark:bg-danger-900/20',
    borderColor: 'border-danger-200 dark:border-danger-800',
  },
  completed: {
    icon: CheckCircle,
    label: 'Imekamilika',
    color: 'text-primary-500',
    bgColor: 'bg-primary-50 dark:bg-primary-900/20',
    borderColor: 'border-primary-200 dark:border-primary-800',
  },
}

export function RequestStatus({
  requestNumber,
  status,
  currentStage,
  applicant,
  department,
  fuelType,
  litres,
  vehicleNumber,
  date,
  onViewDetails,
}: RequestStatusProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  const stages = [
    { name: 'Mwombaji', key: 'mwombaji' },
    { name: 'Mkuu wa Idara', key: 'mkuu-idara' },
    { name: 'Afisa Usafirishaji', key: 'afisa-usafirishaji' },
    { name: 'ADA', key: 'ada-dahrm' },
    { name: 'Ununuzi na Ugavi', key: 'ununuzi-ugavi' },
    { name: 'Imekamilika', key: 'completed' },
  ]

  const getStageStatus = (stageKey: string) => {
    if (status === 'rejected') {
      const currentIndex = stages.findIndex(s => s.key === currentStage)
      const stageIndex = stages.findIndex(s => s.key === stageKey)
      if (stageIndex < currentIndex) return 'completed'
      if (stageIndex === currentIndex) return 'rejected'
      return 'pending'
    }

    const currentIndex = stages.findIndex(s => s.key === currentStage)
    const stageIndex = stages.findIndex(s => s.key === stageKey)
    
    if (stageIndex < currentIndex) return 'completed'
    if (stageIndex === currentIndex) return status === 'completed' ? 'completed' : 'current'
    return 'pending'
  }

  return (
    <div className={`glass-card rounded-2xl p-6 border-l-4 ${config.borderColor}`}>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {requestNumber}
            </h3>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {config.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Hatua: {currentStage}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tarehe</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(date).toLocaleDateString('sw-TZ')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <User className="w-3 h-3" />
            Mwombaji
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{applicant}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Building className="w-3 h-3" />
            Idara
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{department}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Fuel className="w-3 h-3" />
            Mafuta
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{litres}L {fuelType}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Gari
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicleNumber}</p>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => {
            const stageStatus = getStageStatus(stage.key)
            const isCompleted = stageStatus === 'completed'
            const isCurrent = stageStatus === 'current'
            const isRejected = stageStatus === 'rejected'
            const isPending = stageStatus === 'pending'

            return (
              <div key={stage.key} className="flex flex-col items-center flex-1">
                {index < stages.length - 1 && (
                  <div className={`absolute top-4 left-[calc(50%+12px)] right-[calc(-50%+12px)] h-0.5 ${
                    isCompleted ? 'bg-success-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}

                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 relative z-10
                  ${isCompleted ? 'bg-success-500 border-success-500 text-white' : ''}
                  ${isCurrent ? 'bg-primary-500 border-primary-500 text-white animate-pulse' : ''}
                  ${isRejected ? 'bg-danger-500 border-danger-500 text-white' : ''}
                  ${isPending ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400' : ''}
                `}>
                  {isCompleted && <CheckCircle className="w-4 h-4" />}
                  {isCurrent && <Clock className="w-4 h-4 animate-spin-slow" />}
                  {isRejected && <XCircle className="w-4 h-4" />}
                  {isPending && <div className="w-2 h-2 bg-gray-400 rounded-full" />}
                </div>

                <span className={`
                  text-[10px] mt-1.5 text-center whitespace-nowrap
                  ${isCompleted ? 'text-success-600 dark:text-success-400 font-medium' : ''}
                  ${isCurrent ? 'text-primary-600 dark:text-primary-400 font-medium' : ''}
                  ${isRejected ? 'text-danger-600 dark:text-danger-400 font-medium' : ''}
                  ${isPending ? 'text-gray-400 dark:text-gray-500' : ''}
                `}>
                  {stage.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {onViewDetails && (
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onViewDetails}
            className="flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors duration-200"
          >
            Angalia Maelezo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
