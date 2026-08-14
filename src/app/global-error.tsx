'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error boundary caught:', error)
  }, [error])

  return (
    <html lang="sw">
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1.5rem',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Mfumo umekumbana na hitilafu
          </h1>
          <p style={{ maxWidth: 420, color: '#6b7280', fontSize: '0.875rem' }}>
            Tafadhali jaribu tena. Kama tatizo litaendelea, pakia upya ukurasa.
          </p>
          <button
            onClick={() => reset()}
            style={{
              borderRadius: '0.75rem',
              backgroundColor: '#0D9488',
              color: 'white',
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Jaribu Tena
          </button>
        </div>
      </body>
    </html>
  )
}
