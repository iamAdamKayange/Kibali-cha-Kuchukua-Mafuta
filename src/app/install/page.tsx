'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Download, ExternalLink, Sparkles, Smartphone, ArrowLeft, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

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

export default function InstallPage() {
  const { language } = useLanguage()
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  const copy = useMemo(() => {
    if (language === 'en') {
      return {
        eyebrow: 'Mobile Access',
        title: 'Install Kibali Mafuta on Android or iPhone',
        body: 'Use the app like a native mobile app. Android users can install it directly, while iPhone users can add it to the Home Screen.',
        androidTitle: 'Android',
        androidBody: 'Tap install to add the app to your Android device.',
        iosTitle: 'iPhone',
        iosBody: 'Open this page in Safari, tap Share, then Add to Home Screen.',
        install: 'Install app',
        share: 'Share',
        back: 'Back to home',
        note: 'This project is a PWA, so you get a fast install experience without a separate APK/IPA build.',
      }
    }

    return {
      eyebrow: 'Ufikiaji wa Simu',
      title: 'Sakinisha Kibali Mafuta kwenye Android au iPhone',
      body: 'Tumia mfumo kama app ya simu. Watumiaji wa Android wanaweza kusakinisha moja kwa moja, na iPhone wanaweza kuiongeza kwenye Home Screen.',
      androidTitle: 'Android',
      androidBody: 'Bonyeza install ili kuongeza app kwenye kifaa chako cha Android.',
      iosTitle: 'iPhone',
      iosBody: 'Fungua ukurasa huu kwenye Safari, bonyeza Share, kisha Add to Home Screen.',
      install: 'Install app',
      share: 'Share',
      back: 'Rudi mwanzo',
      note: 'Mradi huu ni PWA, hivyo unapata njia ya haraka ya kusakinisha bila build tofauti ya APK/IPA.',
    }
  }, [language])

  useEffect(() => {
    setInstalled(isStandalone())

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

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') {
      setInstalled(true)
    }
    setInstallEvent(null)
  }

  const ios = isIosDevice()

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,245,249,0.92))] px-4 py-6 text-gray-900 dark:bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.16),transparent_35%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.92))] dark:text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col justify-center">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900">
            <ArrowLeft className="h-4 w-4" />
            {copy.back}
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-700 dark:border-primary-900/50 dark:bg-primary-900/20 dark:text-primary-300">
            <Sparkles className="h-4 w-4" />
            {copy.eyebrow}
          </span>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-2xl shadow-gray-900/10 backdrop-blur-xl dark:border-gray-800/60 dark:bg-gray-950/80"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-5">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/30">
                <Smartphone className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  {copy.title}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300">
                  {copy.body}
                </p>
              </div>

              <p className="rounded-2xl border border-primary-200 bg-primary-50/70 p-4 text-sm leading-6 text-primary-900 dark:border-primary-900/40 dark:bg-primary-900/10 dark:text-primary-100">
                {copy.note}
              </p>

              <div className="flex flex-wrap gap-3">
                {installEvent && !installed ? (
                  <button
                    type="button"
                    onClick={handleInstall}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-600"
                  >
                    <Download className="h-4 w-4" />
                    {copy.install}
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
                    <Share2 className="h-4 w-4" />
                    {copy.share}
                  </div>
                )}
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-transparent px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
                >
                  {copy.back}
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/70">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{copy.androidTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{copy.androidBody}</p>
                <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-sm dark:bg-gray-950 dark:text-gray-300">
                  {installEvent ? 'Tap the install button above when Chrome offers it.' : 'Open in Chrome to get the install prompt.'}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/70">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{copy.iosTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{copy.iosBody}</p>
                <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-sm dark:bg-gray-950 dark:text-gray-300">
                  {ios ? 'You are on iPhone, so Safari will show the Share flow.' : 'This device looks like a non-iPhone browser.'}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
