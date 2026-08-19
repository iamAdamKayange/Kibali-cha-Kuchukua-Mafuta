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
    profile: 'Wasifu',
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
    
    // Extra additions
    officialPortal: 'Tovuti Rasmi ya Serikali ya Tanzania',
    systemName: 'Kibali cha Kuchukua Mafuta',
    role_admin: 'Msimamizi',
    role_driver: 'Mwombaji/Dereva',
    role_mkuu_idara: 'Mkuu wa Idara',
    role_afisa_usafirishaji: 'Afisa Usafirishaji',
    role_ada: 'ADA (DAHRM)',
    role_procurement: 'Ununuzi na Ugavi',
    settings_title: 'Mipangilio',
    settings_subtitle: 'Kusimamia muonekano, lugha, na arifa zako za mfumo.',
    theme: 'Mandhari ya Mfumo',
    theme_desc: 'Chagua muonekano wa mwangaza (Light) au giza (Dark).',
    theme_light: 'Njia ya Mwangaza',
    theme_dark: 'Njia ya Giza',
    language_desc: 'Chagua lugha ya kuonyesha maelezo ya mfumo.',
    language_swahili: 'Kiswahili',
    language_english: 'Kiingereza',
    settings_notifications: 'Vikumbusho vya Arifa',
    settings_notifications_desc: 'Ruhusu kupokea arifa mpya papo hapo skrini ya juu.',
    settings_security: 'Usalama',
    settings_security_desc: 'Hakikisha wasifu wako na nenosiri viko salama.',
    profile_title: 'Wasifu wa Mtumiaji',
    profile_subtitle: 'Sasisha maelezo ya akaunti yako na ubadilishe nenosiri.',
    personal_details: 'Taarifa Binafsi',
    first_name: 'Jina la Kwanza',
    last_name: 'Jina la Mwisho',
    phone_number: 'Namba ya Simu',
    save_profile: 'Hifadhi Wasifu',
    change_password: 'Badilisha Nenosiri',
    current_password: 'Nenosiri la Sasa',
    new_password: 'Nenosiri Jipya',
    confirm_password: 'Thibitisha Nenosiri',
    profile_updated: 'Wasifu umesasishwa kikamilifu.',
    password_changed: 'Nenosiri limebadilishwa kikamilifu.',
    notifications_title: 'Arifa Zako',
    notifications_subtitle: 'Orodha ya arifa za maombi na mabadiliko ya vibali vyako.',
    mark_all_read: 'Weka zote zimesomwa',
    clear_all: 'Futa Arifa Zote',
    no_notifications: 'Hakuna arifa mpya kwa sasa.',
    status_pending: 'Inasubiri',
    status_submitted: 'Imewasilishwa',
    status_approved: 'Imeidhinishwa',
    status_rejected: 'Imekataliwa',
    status_completed: 'Imekamilika',
    status_cancelled: 'Imefutwa',
    status_pending_head: 'Inasubiri Idhini ya Mkuu',
    status_pending_transport: 'Inasubiri Afisa Usafirishaji',
    status_pending_da: 'Inasubiri ADA',
    status_pending_fuel: 'Inasubiri Utoaji Mafuta',
    status_head_approved: 'Imeidhinishwa na Mkuu',
    status_transport_approved: 'Imeidhinishwa na Usafirishaji',
    status_ada_approved: 'Imeidhinishwa na ADA',
    status_head_rejected: 'Imekataliwa na Mkuu',
    status_transport_rejected: 'Imekataliwa na Usafirishaji',
    status_ada_rejected: 'Imekataliwa na ADA',
    status_completed_badge: 'Utoaji Umekamilika',
    stage_label: 'Hatua ya Sasa',
    view_action: 'Angalia',
    no_requests_msg: 'Hakuna maombi ya kuonyesha kwa sasa.',
    no_requests_desc: 'Data itaonekana hapa baada ya backend kurudisha maombi yanayohusika.',
    department_label: 'Idara / Kitengo',
    choose_department: 'Chagua idara au kitengo',
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
    
    // Extra additions
    officialPortal: 'Tanzania Government Official Portal',
    systemName: 'Fuel Permit Management System',
    role_admin: 'Administrator',
    role_driver: 'Applicant/Driver',
    role_mkuu_idara: 'Head of Department',
    role_afisa_usafirishaji: 'Transport Officer',
    role_ada: 'ADA (DAHRM)',
    role_procurement: 'Procurement & Supplies',
    settings_title: 'Settings',
    settings_subtitle: 'Manage your visual themes, language, and push notification configurations.',
    theme: 'System Theme',
    theme_desc: 'Select between Light mode or Dark mode visual styles.',
    theme_light: 'Light Mode',
    theme_dark: 'Dark Mode',
    language_desc: 'Choose your default display language.',
    language_swahili: 'Kiswahili',
    language_english: 'English',
    settings_notifications: 'Push Notification Alerts',
    settings_notifications_desc: 'Allow immediate push alerts directly on top of the browser screen.',
    settings_security: 'Security',
    settings_security_desc: 'Keep your credentials, session, and password safe.',
    profile_title: 'User Profile',
    profile_subtitle: 'Update your account coordinates and change passwords.',
    personal_details: 'Personal Coordinates',
    first_name: 'First Name',
    last_name: 'Last Name',
    phone_number: 'Phone Number',
    save_profile: 'Save Profile Details',
    change_password: 'Update Password',
    current_password: 'Current Password',
    new_password: 'New Password',
    confirm_password: 'Confirm New Password',
    profile_updated: 'Profile coordinates updated successfully.',
    password_changed: 'Your password was changed successfully.',
    notifications_title: 'Your Notifications',
    notifications_subtitle: 'Chronological timeline of permits processing and status updates.',
    mark_all_read: 'Mark All Read',
    clear_all: 'Clear All Notifications',
    no_notifications: 'No new notifications at this time.',
    status_pending: 'Pending',
    status_submitted: 'Submitted',
    status_approved: 'Approved',
    status_rejected: 'Rejected',
    status_completed: 'Completed',
    status_cancelled: 'Cancelled',
    status_pending_head: 'Pending Head Approval',
    status_pending_transport: 'Pending Transport Review',
    status_pending_da: 'Pending ADA Review',
    status_pending_fuel: 'Pending Fuel Issuance',
    status_head_approved: 'Approved by Head',
    status_transport_approved: 'Approved by Transport',
    status_ada_approved: 'Approved by ADA',
    status_head_rejected: 'Rejected by Head',
    status_transport_rejected: 'Rejected by Transport',
    status_ada_rejected: 'Rejected by ADA',
    status_completed_badge: 'Fuel Issued Successfully',
    stage_label: 'Current Stage',
    view_action: 'View details',
    no_requests_msg: 'No requests found.',
    no_requests_desc: 'Data will appear here once backend returns matching requests.',
    department_label: 'Department / Section',
    choose_department: 'Choose department or section',
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
