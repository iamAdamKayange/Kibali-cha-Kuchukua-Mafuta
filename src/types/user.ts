import { Role, Department } from '@/lib/constants'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: Department
  role: Role
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface UserRegistrationData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  department: Department
  role: Role
}