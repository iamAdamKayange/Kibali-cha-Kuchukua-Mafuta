'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Download, Share, Smartphone, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { motion } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isIosDevice() {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
}

export function PWAInstallPrompt() {
  const pathname = usePathname()
  const { language } = useLanguage()
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [installed, setInstalled] = useState(false)

  const copy = useMemo(() => {
    if (language === 'en') {
      return {
        title: 'Install Kibali Mafuta',
        body: 'Use this dashboard like a mobile app on Android or iPhone.',
        install: 'Install app',
        ios: 'On iPhone: tap Share, then Add to Home Screen.',
        later: 'Later',
      }
    }

    return {
      title: 'Sakinisha Kibali Mafuta',
      body: 'Tumia dashboard hii kama app ya simu kwenye Android au iPhone.',
      install: 'Download / Install app',
      ios: 'Kwenye iPhone: bonyeza Share, kisha Add to Home Screen.',
      later: 'Baadaye',
    }
  }, [language])

  useEffect(() => {
    setInstalled(isStandalone())
    setDismissed(localStorage.getItem('pwa-install-dismissed') === 'true')

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    const handleInstalled = () => {
      setInstalled(true)
      setInstallEvent(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const shouldShow =
    pathname !== '/install' &&
    !installed &&
    !dismissed &&
    (installEvent || isIosDevice())

  if (!shouldShow) return null

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') setInstalled(true)
    setInstallEvent(null)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true')
    setDismissed(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="mx-4 mt-4 rounded-2xl border border-primary-200 bg-primary-50/95 p-4 shadow-xl shadow-primary-900/5 backdrop-blur-xl dark:border-primary-900/50 dark:bg-primary-950/40"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{copy.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{isIosDevice() && !installEvent ? copy.ios : copy.body}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {installEvent ? (
            <button
              type="button"
              onClick={handleInstall}
            className="tap-target inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              <Download className="h-4 w-4" />
              {copy.install}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-primary-700 dark:bg-gray-900 dark:text-primary-300">
              <Share className="h-4 w-4" />
              Share
            </div>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-900/70"
            aria-label={copy.later}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
