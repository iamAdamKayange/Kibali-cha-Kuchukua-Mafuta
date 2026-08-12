export const FUEL_TYPES = ['DIESEL', 'PETROL'] as const
export type FuelType = typeof FUEL_TYPES[number]

export const DEPARTMENTS = [
  'Habari',
  'Utamaduni',
  'Sanaa',
  'Michezo',
  'Usafirishaji',
  'ADA',
  'DAHRM',
] as const
export type Department = typeof DEPARTMENTS[number]

export const ROLES = [
  'Mwombaji/Dereva',
  'Mkuu wa Idara/Kitengo',
  'Afisa Usafirishaji',
  'ADA/DAHRM',
  'Ununuzi na Ugavi',
] as const
export type Role = typeof ROLES[number]

export const REQUEST_STATUS = {
  PENDING_HEAD_APPROVAL: 'PENDING_HEAD_APPROVAL',
  PENDING_TRANSPORT_APPROVAL: 'PENDING_TRANSPORT_APPROVAL',
  PENDING_DA_APPROVAL: 'PENDING_DA_APPROVAL',
  PENDING_FUEL_ISSUANCE: 'PENDING_FUEL_ISSUANCE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  HEAD_REJECTED: 'HEAD_REJECTED',
  TRANSPORT_REJECTED: 'TRANSPORT_REJECTED',
  ADA_REJECTED: 'ADA_REJECTED',
} as const
export type RequestStatus = typeof REQUEST_STATUS[keyof typeof REQUEST_STATUS]

export const STATUS_LABELS: Record<string, string> = {
  PENDING_HEAD_APPROVAL: 'Inasubiri Mkuu wa Idara',
  PENDING_TRANSPORT_APPROVAL: 'Inasubiri Afisa Usafirishaji',
  PENDING_DA_APPROVAL: 'Inasubiri ADA/DAHRM',
  PENDING_FUEL_ISSUANCE: 'Inasubiri Ununuzi na Ugavi',
  COMPLETED: 'Imekamilika',
  CANCELLED: 'Imefutwa',
  HEAD_REJECTED: 'Imekataliwa na Mkuu',
  TRANSPORT_REJECTED: 'Imekataliwa na Usafirishaji',
  ADA_REJECTED: 'Imekataliwa na ADA',
}
