'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log so the real error is visible in the console / error tracking,
    // instead of the page silently going blank.
    console.error('Route error boundary caught:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6 text-center dark:bg-gray-950">
      <div className="rounded-full bg-danger-50 p-4 dark:bg-danger-900/20">
        <AlertTriangle className="h-8 w-8 text-danger-500" />
      </div>

      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        Hitilafu imetokea
      </h1>

      <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
        Kuna tatizo lililotokea wakati wa kupakia ukurasa huu. Jaribu tena
        bila kuhitaji kupakia upya ukurasa mzima.
      </p>

      <div className="mt-2 flex gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-3 font-medium text-white transition hover:bg-primary-600"
        >
          <RefreshCcw className="h-4 w-4" />
          Jaribu Tena
        </button>

        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
        >
          <Home className="h-4 w-4" />
          Rudi Dashibodi
        </a>
      </div>
    </div>
  )
}
