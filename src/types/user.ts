import { Department } from '@/lib/constants'

export type UserRole =
  | 'ADMIN'
  | 'DRIVER'
  | 'HEAD_OF_DEPARTMENT'
  | 'TRANSPORT_OFFICER'
  | 'ADA_DAHRM'
  | 'PROCUREMENT'
  | 'Mwombaji/Dereva'
  | 'Mkuu wa Idara/Kitengo'
  | 'Afisa Usafirishaji'
  | 'ADA'
  | 'Ununuzi na Ugavi'

export interface UserDepartment {
  id: string
  name: string
  description?: string | null
}

export interface User {
  id: string
  firstName: string
  lastName: string
  title?: string | null
  email: string
  phone: string
  department?: Department | UserDepartment | string | null
  departmentId?: string | null
  role: UserRole
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
  role: UserRole
}
