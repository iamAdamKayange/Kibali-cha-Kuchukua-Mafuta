'use client'

import { Languages } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export function LanguageToggle() {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <button
      onClick={toggleLanguage}
      className="px-2.5 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
      aria-label={t('language')}
      title={t('language')}
    >
      <Languages className="w-5 h-5" />
      <span className="uppercase">{language}</span>
    </button>
  )
}
