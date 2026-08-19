import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { OfflineNotice } from '@/components/common/OfflineNotice'
import { PWAInstallPrompt } from '@/components/common/PWAInstallPrompt'
import { AppExperience } from '@/components/common/AppExperience'

export const metadata: Metadata = {
  title: 'Kibali cha Kuchukua Mafuta',
  description: 'Fuel Permit Management System - Ministry of Information, Culture, Arts and Sports',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kibali cha Kuchukua Mafuta',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0D9488',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sw" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <main className="relative isolate min-h-screen bg-transparent transition-colors duration-300">
                <OfflineNotice />
                <PWAInstallPrompt />
                <AppExperience>{children}</AppExperience>
              </main>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
