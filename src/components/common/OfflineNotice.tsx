'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine)

    updateStatus()
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[100] border-b border-amber-300 bg-amber-50 px-4 py-2 text-amber-900 shadow-sm dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 text-center text-sm font-medium">
        <WifiOff className="h-4 w-4 flex-shrink-0" />
        <span>Huna muunganisho wa intaneti. Kurasa zilizohifadhiwa zitaendelea kufunguka; taarifa mpya zitatumwa mtandao utakaporudi.</span>
      </div>
    </div>
  )
}
