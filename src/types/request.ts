import { FuelType, RequestStatus } from '@/lib/constants'

export interface RejectionDetails {
  rejectedBy: string
  rejectedByUser: string
  reason: string
  rejectedAt: string | Date
}

export interface FuelRequest {
  id: string
  requestNumber: string
  driverId?: string
  driver?: {
    id: string
    firstName: string
    lastName: string
    email: string
    employeeNumber?: string
    department?: { id: string; name: string }
  }
  vehicle?: {
    id: string
    vehicleNumber: string
    gpsa: string
    fuelType: string
  }
  applicantId: string
  applicantName: string
  department: string | { id: string; name: string }
  fuelType: FuelType | string
  litres: number
  requestedLitres?: number
  approvedLitres?: number
  issuedLitres?: number
  vehicleNumber: string
  gpsa: string
  purpose: string
  kmFrom: number
  kmTo: number
  kmUsed: number
  lastFuelReceived: number
  date: Date
  signature: string
  
  status: string // Use string to handle all status types
  currentStage: 'mwombaji' | 'mkuu-idara' | 'afisa-usafirishaji' | 'ada-dahrm' | 'ununuzi-ugavi' | 'completed' | string
  rejectionDetails?: RejectionDetails
  rejectionReason?: string
  
  sectionB?: {
    approved: boolean
    reason?: string
    name: string
    title: string
    signature: string
    date: Date
  }
  
  sectionC?: {
    approved: boolean
    litres: number
    reason?: string
    logbookNumber: string
    to: string
    title: string
    signature: string
    date: Date
  }
  
  sectionD?: {
    approved: boolean
    litres: number
    vehicleNumber: string
    title: string
    signature: string
    date: Date
  }
  
  sectionE?: {
    fuelType: FuelType | string
    litres: number
    tokenNumber: string
    name: string
    title: string
    signature: string
    date: Date
  }

  finalApproverId?: string
  finalApprovedAt?: Date | string

  createdAt: Date | string
  updatedAt: Date | string
}

export interface RequestFilter {
  status?: string
  applicantId?: string
  department?: string
  dateFrom?: Date
  dateTo?: Date
  vehicleNumber?: string
}
