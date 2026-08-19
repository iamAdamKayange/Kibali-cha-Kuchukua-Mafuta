'use client'

import { motion } from 'framer-motion'
import {
  Fuel,
  User,
  Car,
  ArrowRight,
  Building,
} from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { FuelRequest } from '@/types'

interface MockRequest {
  id: string
  requestNumber: string
  applicant: string
  department: string
  fuelType: 'Diesel' | 'Petrol'
  litres: number
  vehicleNumber: string
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'completed'
  date: string
  currentStage: string
}

type RequestType = FuelRequest | MockRequest

interface RequestCardProps {
  request: RequestType
  onViewDetails?: (id: string) => void
}

function isFuelRequest(request: RequestType): request is FuelRequest {
  return 'applicantId' in request && 'applicantName' in request
}

/**
 * Safely get department name.
 * Backend may return either:
 * - "ICT"
 * - { id: "...", name: "ICT" }
 * - undefined/null
 */
function getDepartmentName(request: RequestType): string {
  const department = request.department

  if (!department) {
    return 'N/A'
  }

  if (typeof department === 'string') {
    return department
  }

  if (
    typeof department === 'object' &&
    'name' in department &&
    typeof department.name === 'string'
  ) {
    return department.name
  }

  return 'N/A'
}

function getWorkflowStageLabel(request: RequestType): string {
  const stageFromSource = isFuelRequest(request)
    ? String(request.currentStage || '').trim()
    : String(request.currentStage || '').trim()

  if (stageFromSource) {
    return stageFromSource.replace(/-/g, ' ').replace(/_/g, ' ')
  }

  const normalizedStatus = String(request.status || '').toUpperCase()

  const statusToStage: Record<string, string> = {
    PENDING_HEAD_APPROVAL: 'mkuu wa idara',
    HEAD_APPROVED: 'mkuu wa idara',
    HEAD_REJECTED: 'mkuu wa idara',
    PENDING_TRANSPORT_APPROVAL: 'afisa usafirishaji',
    TRANSPORT_APPROVED: 'afisa usafirishaji',
    TRANSPORT_REJECTED: 'afisa usafirishaji',
    PENDING_DA_APPROVAL: 'ada/dahrm',
    ADA_APPROVED: 'ada/dahrm',
    ADA_REJECTED: 'ada/dahrm',
    PENDING_FUEL_ISSUANCE: 'ununuzi na ugavi',
    COMPLETED: 'imekamilika',
    CANCELLED: 'imefutwa',
  }

  return statusToStage[normalizedStatus] || 'N/A'
}

export function RequestCard({
  request,
  onViewDetails,
}: RequestCardProps) {
  const router = useRouter()

  const getStatus = (
    status: string
  ): 'pending' | 'submitted' | 'approved' | 'rejected' | 'completed' => {
    const normalized = String(status || '').toLowerCase()

    if (normalized.includes('pending')) {
      return 'pending'
    }

    if (
      normalized === 'submitted' ||
      normalized === 'pending_approval'
    ) {
      return 'submitted'
    }

    if (
      normalized === 'approved' ||
      normalized === 'fuel_issued'
    ) {
      return 'approved'
    }

    if (normalized === 'rejected') {
      return 'rejected'
    }

    if (
      normalized === 'completed' ||
      normalized === 'complete'
    ) {
      return 'completed'
    }

    return 'pending'
  }

  const getApplicantName = (req: RequestType): string => {
    if (isFuelRequest(req)) {
      return (
        req.applicantName ||
        req.applicantId ||
        'N/A'
      )
    }

    return req.applicant || 'N/A'
  }

  const getLitres = (req: RequestType): number => {
    if (isFuelRequest(req)) {
      return (
        req.litres ??
        req.requestedLitres ??
        0
      )
    }

    return req.litres ?? 0
  }

  const getFuelType = (req: RequestType): string => {
    if (isFuelRequest(req)) {
      return req.fuelType || 'N/A'
    }

    return req.fuelType || 'N/A'
  }

  const getDate = (req: RequestType): string => {
    try {
      if (isFuelRequest(req)) {
        const value = req.createdAt || req.date

        if (!value) {
          return 'N/A'
        }

        return new Date(value).toLocaleDateString('sw-TZ')
      }

      return req.date || 'N/A'
    } catch {
      return 'N/A'
    }
  }

  const status = getStatus(request.status)
  const applicantName = getApplicantName(request)
  const departmentName = getDepartmentName(request)
  const litres = getLitres(request)
  const fuelType = getFuelType(request)
  const date = getDate(request)
  const currentStage = getWorkflowStageLabel(request)

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) {
      return
    }
    if (onViewDetails) {
      onViewDetails(request.id)
    } else {
      router.push(`/requests/${request.id}`)
    }
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -4,
      }}
      onClick={handleClick}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-card hover:shadow-card-hover dark:shadow-card-dark border border-gray-200 dark:border-gray-800 p-5 transition-all duration-300 cursor-pointer"
    >

      {/* Header */}
      <div className="flex items-start justify-between mb-3">

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">

            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {request.requestNumber}
            </h3>

            <StatusBadge status={status} />

          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {date}
          </p>
        </div>

        <div className="flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400 shrink-0">
          <Fuel className="w-4 h-4" />
          {litres}L
        </div>

      </div>

      {/* Request information */}
      <div className="space-y-2">

        {/* Applicant + Department */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">

          <User className="w-4 h-4 text-gray-400 shrink-0" />

          <span className="truncate">
            {applicantName}
          </span>

          <span className="text-gray-300 dark:text-gray-600">
            •
          </span>

          <Building className="w-4 h-4 text-gray-400 shrink-0" />

          <span className="truncate">
            {departmentName}
          </span>

        </div>

        {/* Vehicle + Fuel */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">

          <Car className="w-4 h-4 text-gray-400 shrink-0" />

          <span className="truncate">
            {request.vehicleNumber || 'N/A'}
          </span>

          <span className="text-gray-300 dark:text-gray-600">
            •
          </span>

          <span className="capitalize">
            {fuelType}
          </span>

        </div>

      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">

          <span className="capitalize">
            Hatua: {currentStage}
          </span>

        </div>

        {onViewDetails ? (

          <button
            type="button"
            onClick={() => onViewDetails(request.id)}
            className="flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors duration-200"
          >
            Angalia

            <ArrowRight className="w-4 h-4" />
          </button>

        ) : (

          <Link
            href={`/requests/${request.id}`}
            className="flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors duration-200"
          >
            Angalia

            <ArrowRight className="w-4 h-4" />
          </Link>

        )}

      </div>

    </motion.div>
  )
}
