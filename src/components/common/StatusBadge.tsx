'use client'

import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface StatusBadgeProps {
  status: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Lowercase statuses
  pending: {
    label: 'Inasubiri',
    className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  },
  submitted: {
    label: 'Imewasilishwa',
    className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  },
  approved: {
    label: 'Imeidhinishwa',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  },
  rejected: {
    label: 'Imekataliwa',
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  },
  completed: {
    label: 'Imekamilika',
    className: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400',
  },
  
  // Uppercase statuses
  PENDING: {
    label: 'Inasubiri',
    className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  },
  PENDING_HEAD_APPROVAL: {
    label: 'Inasubiri Idhini',
    className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  },
  PENDING_TRANSPORT_APPROVAL: {
    label: 'Inasubiri Usafirishaji',
    className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  },
  PENDING_DA_APPROVAL: {
    label: 'Inasubiri ADA',
    className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  },
  PENDING_FUEL_ISSUANCE: {
    label: 'Inasubiri Utoaji',
    className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  },
  SUBMITTED: {
    label: 'Imewasilishwa',
    className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  },
  APPROVED: {
    label: 'Imeidhinishwa',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  },
  HEAD_APPROVED: {
    label: 'Idhini ya Mkuu',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  },
  TRANSPORT_APPROVED: {
    label: 'Idhini ya Usafirishaji',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  },
  ADA_APPROVED: {
    label: 'Idhini ya ADA',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  },
  REJECTED: {
    label: 'Imekataliwa',
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  },
  HEAD_REJECTED: {
    label: 'Imekataliwa na Mkuu',
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  },
  TRANSPORT_REJECTED: {
    label: 'Imekataliwa na Usafirishaji',
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  },
  ADA_REJECTED: {
    label: 'Imekataliwa na ADA',
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  },
  COMPLETED: {
    label: 'Imekamilika',
    className: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400',
  },
  CANCELLED: {
    label: 'Imefutwa',
    className: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

const statusTranslationKeyMap: Record<string, string> = {
  pending: 'status_pending',
  submitted: 'status_submitted',
  approved: 'status_approved',
  rejected: 'status_rejected',
  completed: 'status_completed',
  PENDING: 'status_pending',
  PENDING_HEAD_APPROVAL: 'status_pending_head',
  PENDING_TRANSPORT_APPROVAL: 'status_pending_transport',
  PENDING_DA_APPROVAL: 'status_pending_da',
  PENDING_FUEL_ISSUANCE: 'status_pending_fuel',
  SUBMITTED: 'status_submitted',
  APPROVED: 'status_approved',
  HEAD_APPROVED: 'status_head_approved',
  TRANSPORT_APPROVED: 'status_transport_approved',
  ADA_APPROVED: 'status_ada_approved',
  REJECTED: 'status_rejected',
  HEAD_REJECTED: 'status_head_rejected',
  TRANSPORT_REJECTED: 'status_transport_rejected',
  ADA_REJECTED: 'status_ada_rejected',
  COMPLETED: 'status_completed_badge',
  CANCELLED: 'status_cancelled',
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const { t } = useLanguage()
  const config = statusConfig[status] || statusConfig.pending
  const translationKey = statusTranslationKeyMap[status] || 'status_pending'

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      sizeClasses[size],
      config.className,
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {t(translationKey)}
    </span>
  )
}