export * from './user'
export * from './request'
// Add this to src/types/index.ts
export interface MockRequest {
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