'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Language = 'sw' | 'en'

type Dictionary = Record<string, string>

const dictionaries: Record<Language, Dictionary> = {
  sw: {
    dashboard: 'Dashibodi',
    registerUsers: 'Sajili Watumiaji',
    allUsers: 'Watumiaji Wote',
    reports: 'Taarifa',
    requestFuel: 'Omba Mafuta',
    myRequests: 'Maombi Yangu',
    fuelHistory: 'Historia ya Mafuta',
    reviewRequests: 'Kukagua Maombi',
    allRequests: 'Maombi Yote',
    history: 'Historia',
    settings: 'Mipangilio',
    logout: 'Toka',
    searchPlaceholder: 'Tafuta ombi, gari, au mwombaji...',
    notifications: 'Arifa',
    viewAllNotifications: 'Ona Arifa Zote',
    profile: 'Profile',
    language: 'Lugha',
    fuelRequestTitle: 'Omba Mafuta',
    fuelRequestSubtitle: 'Jaza fomu hapa chini kuomba mafuta',
    stepOne: 'Hatua 1/5',
    sectionAApplicant: 'Sehemu A: Mwombaji/Dereva',
    submittingRequest: 'Inawasilisha ombi...',
    driver: 'Dereva',
    yourAccount: 'Akaunti yako',
    department: 'Idara',
    fromAccount: 'Inatoka kwenye akaunti',
    employeeNumber: 'Namba ya Mtumishi',
    fuelType: 'Aina ya Mafuta',
    litres: 'Lita',
    vehicleNumber: 'Namba ya Gari',
    chooseVehicle: 'Chagua gari',
    fromVehicle: 'Itatokana na gari',
    purpose: 'Kwa ajili ya',
    purposePlaceholder: 'Andika kazi au madhumuni ya safari...',
    kmFrom: 'Km za kuanzia',
    kmTo: 'Km za sasa',
    kmUsed: 'Km zilizotumika',
    lastFuelReceived: 'Mara ya mwisho nilipewa lita',
    applicantSignature: 'Saini ya Mwombaji',
    signaturePlaceholder: 'Weka saini yako',
    digitalConfirmApplicant: 'Nathibitisha kidigitali kuwa taarifa za ombi hili ni sahihi na zitaenda kwenye hatua ya idhini.',
    submitRequest: 'Peleka Ombi',
  },
  en: {
    dashboard: 'Dashboard',
    registerUsers: 'Register Users',
    allUsers: 'All Users',
    reports: 'Reports',
    requestFuel: 'Request Fuel',
    myRequests: 'My Requests',
    fuelHistory: 'Fuel History',
    reviewRequests: 'Review Requests',
    allRequests: 'All Requests',
    history: 'History',
    settings: 'Settings',
    logout: 'Logout',
    searchPlaceholder: 'Search request, vehicle, or applicant...',
    notifications: 'Notifications',
    viewAllNotifications: 'View All Notifications',
    profile: 'Profile',
    language: 'Language',
    fuelRequestTitle: 'Request Fuel',
    fuelRequestSubtitle: 'Fill in the form below to request fuel',
    stepOne: 'Step 1/5',
    sectionAApplicant: 'Section A: Applicant/Driver',
    submittingRequest: 'Submitting request...',
    driver: 'Driver',
    yourAccount: 'Your account',
    department: 'Department',
    fromAccount: 'From your account',
    employeeNumber: 'Employee Number',
    fuelType: 'Fuel Type',
    litres: 'Litres',
    vehicleNumber: 'Vehicle Number',
    chooseVehicle: 'Choose vehicle',
    fromVehicle: 'Filled from vehicle',
    purpose: 'Purpose',
    purposePlaceholder: 'Write the work or trip purpose...',
    kmFrom: 'Starting KM',
    kmTo: 'Current KM',
    kmUsed: 'KM Used',
    lastFuelReceived: 'Last fuel received in litres',
    applicantSignature: 'Applicant Signature',
    signaturePlaceholder: 'Enter your signature',
    digitalConfirmApplicant: 'I digitally confirm that this request information is correct and ready for approval.',
    submitRequest: 'Submit Request',
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('sw')

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language | null
    if (stored === 'en' || stored === 'sw') {
      setLanguageState(stored)
      document.documentElement.lang = stored
    }
  }, [])

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage)
    localStorage.setItem('language', nextLanguage)
    document.documentElement.lang = nextLanguage
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === 'sw' ? 'en' : 'sw'),
      t: (key: string) => dictionaries[language][key] || key,
    }),
    [language]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
