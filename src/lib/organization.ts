export type OrganizationCategory = 'IDARA' | 'KITENGO'

export const OFFICIAL_ORGANIZATION_ADDRESS = {
  country: 'The United Republic of Tanzania',
  officer: 'Katibu Mkuu',
  ministry: 'WIZARA YA HABARI, UTAMADUNI, SANAA NA MICHEZO',
  postal: 'P.O. Box 25, Dodoma, Tanzania',
  city: 'Mji wa Serikali Mtumba',
  email: 'km@michezo.go.tz',
  telephone: 'Telephone: +255 26 2322 129',
  fax: 'Nukushi: +255 26 2322 128',
}

export const ORGANIZATION_CATEGORIES: Array<{
  value: OrganizationCategory
  label: string
}> = [
  { value: 'IDARA', label: 'Idara' },
  { value: 'KITENGO', label: 'Kitengo' },
]

export const ORGANIZATION_UNITS: Record<OrganizationCategory, string[]> = {
  IDARA: [
    'IDARA YA HABARI',
    'IDARA YA UTAMADUNI',
    'IDARA YA SANAA',
    'IDARA YA MICHEZO',
    'IDARA YA SELA NA MIPANGO',
    'IDARA YA UTAWALA NA RASLIMALI WATU',
  ],
  KITENGO: [
    'KITENGO CHA TEHAMA',
    'KITENGO CHA HABARI SERIKALINI',
    'KITENGO CHA UFUATILIAJI NA TATHMINI',
    'KITENGO CHA MKAGUZI WA NDANI',
    'KITENGO CHA HUDUMA ZA SHERIA',
    'KITENGO CHA FEDHA',
    'KITENGO CHA UGAVI NA MANUNUZI',
  ],
}

export function normalizeCategory(value?: string | null): OrganizationCategory | '' {
  const normalized = String(value || '').trim().toUpperCase()
  if (normalized === 'IDARA' || normalized === 'KITENGO') {
    return normalized
  }
  return ''
}

export function getCategoryLabel(value?: string | null) {
  const category = normalizeCategory(value)
  if (category === 'IDARA') return 'Idara'
  if (category === 'KITENGO') return 'Kitengo'
  return 'N/A'
}

export function inferCategoryFromDepartmentName(name?: string | null) {
  const normalized = String(name || '').trim().toUpperCase()

  if (ORGANIZATION_UNITS.IDARA.includes(normalized)) {
    return 'IDARA' as const
  }

  if (ORGANIZATION_UNITS.KITENGO.includes(normalized)) {
    return 'KITENGO' as const
  }

  return ''
}
