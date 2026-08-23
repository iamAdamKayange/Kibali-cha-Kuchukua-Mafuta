const TANZANIA_TIME_ZONE = 'Africa/Dar_es_Salaam'

type DateValue = string | number | Date | null | undefined

function toValidDate(value: DateValue): Date | null {
  if (!value) return null

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getDateFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: TANZANIA_TIME_ZONE,
    ...options,
  })
}

export function formatTanzaniaDate(
  value: DateValue,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  locale = 'sw-TZ'
) {
  const date = toValidDate(value)
  if (!date) return 'N/A'

  return getDateFormatter(locale, options).format(date)
}

export function formatTanzaniaDateTime(
  value: DateValue,
  locale = 'sw-TZ'
) {
  return formatTanzaniaDate(value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }, locale)
}

export function toTanzaniaIsoString(value: DateValue) {
  const date = toValidDate(value)
  return date ? date.toISOString() : ''
}
