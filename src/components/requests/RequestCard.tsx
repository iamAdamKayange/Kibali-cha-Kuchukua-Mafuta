'use client'

import { motion } from 'framer-motion'
import { Fuel, User, Car, MapPin, ArrowRight, Building } from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge'
import Link from 'next/link'
import type { FuelRequest } from '@/types'

// Define mock request type
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

// Union type for request
type RequestType = FuelRequest | MockRequest

interface RequestCardProps {
  request: RequestType
  onViewDetails?: (id: string) => void
}

// Helper to check if request is FuelRequest or MockRequest
function isFuelRequest(request: RequestType): request is FuelRequest {
  return 'applicantId' in request && 'applicantName' in request
}

export function RequestCard({ request, onViewDetails }: RequestCardProps) {
  // Get status with proper type
  const getStatus = (status: string): 'pending' | 'submitted' | 'approved' | 'rejected' | 'completed' => {
    const statusMap: Record<string, 'pending' | 'submitted' | 'approved' | 'rejected' | 'completed'> = {
      'pending': 'pending',
      'PENDING': 'pending',
      'submitted': 'submitted',
      'SUBMITTED': 'submitted',
      'approved': 'approved',
      'APPROVED': 'approved',
      'rejected': 'rejected',
      'REJECTED': 'rejected',
      'completed': 'completed',
      'COMPLETED': 'completed',
    }
    return statusMap[status] || 'pending'
  }

  // Get applicant name
  const getApplicantName = (req: RequestType): string => {
    if (isFuelRequest(req)) {
      return req.applicantName || req.applicantId || 'N/A'
    }
    return req.applicant || 'N/A'
  }

  // Get litres
  const getLitres = (req: RequestType): number => {
    if (isFuelRequest(req)) {
      return req.litres || req.requestedLitres || 0
    }
    return req.litres || 0
  }

  // Get fuel type
  const getFuelType = (req: RequestType): string => {
    if (isFuelRequest(req)) {
      return req.fuelType || 'N/A'
    }
    return req.fuelType || 'N/A'
  }

  // Get date
  const getDate = (req: RequestType): string => {
    if (isFuelRequest(req)) {
      return new Date(req.createdAt || req.date).toLocaleDateString('sw-TZ')
    }
    return req.date || new Date().toLocaleDateString('sw-TZ')
  }

  // Get current stage
  const getCurrentStage = (req: RequestType): string => {
    if (isFuelRequest(req)) {
      return req.currentStage?.replace(/-/g, ' ') || 'N/A'
    }
    return req.currentStage || 'N/A'
  }

  const status = getStatus(request.status)
  const applicantName = getApplicantName(request)
  const litres = getLitres(request)
  const fuelType = getFuelType(request)
  const date = getDate(request)
  const currentStage = getCurrentStage(request)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-card hover:shadow-card-hover dark:shadow-card-dark border border-gray-200 dark:border-gray-800 p-5 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {request.requestNumber}
            </h3>
            <StatusBadge status={status} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {date}
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400">
          <Fuel className="w-4 h-4" />
          {litres}L
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <User className="w-4 h-4 text-gray-400" />
          <span>{applicantName}</span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <Building className="w-4 h-4 text-gray-400" />
          <span>{request.department}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Car className="w-4 h-4 text-gray-400" />
          <span>{request.vehicleNumber}</span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="capitalize">{fuelType}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="capitalize">Hatua: {currentStage}</span>
        </div>
        {onViewDetails ? (
          <button
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