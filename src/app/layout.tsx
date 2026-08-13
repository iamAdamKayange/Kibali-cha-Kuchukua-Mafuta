import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { OfflineNotice } from '@/components/common/OfflineNotice'
import { PWAInstallPrompt } from '@/components/common/PWAInstallPrompt'
import { AppExperience } from '@/components/common/AppExperience'

const inter = Inter({ subsets: ['latin'] })

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
    statusBarStyle: 'default',
    title: 'Kibali Mafuta',
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
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <main className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
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
