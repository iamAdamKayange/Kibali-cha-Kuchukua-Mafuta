import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatTanzaniaDate } from '@/lib/dates'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return formatTanzaniaDate(date, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat('sw-TZ', {
    timeZone: 'Africa/Dar_es_Salaam',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return `${formatDate(date)} ${formatTime(date)}`
}

export function generateRequestNumber() {
  const prefix = 'FR'
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `${prefix}-${random}`
}

export function generateTokenNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
