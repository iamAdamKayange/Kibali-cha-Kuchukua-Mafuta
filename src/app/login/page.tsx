'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { login, loading: sessionLoading } = useAuth()

  const [showPassword, setShowPassword] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [error, setError] =
    useState('')

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      await login(
        email.trim(),
        password
      )
    } catch (error: any) {
      console.error(
        'Login failed:',
        error
      )

      setError(
        error?.message ||
          'Email au password si sahihi.'
      )
    } finally {
      setLoading(false)
    }
  }

  const isLoading = loading

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 p-4 text-white">
      <Image
        src="/assets/tanzania-emblem.png"
        alt="Alama ya Taifa la Tanzania"
        fill
        priority
        className="object-cover object-center opacity-20 mix-blend-screen"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.95),rgba(8,47,73,0.76),rgba(2,6,23,0.95))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(20,184,166,0.12),transparent_30%)]" />

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="relative z-10 w-full max-w-md"
      >

        {/* Logo */}
        <div className="text-center mb-8">

          <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur">
            <Image
              src="/assets/tanzania-emblem.png"
              alt="Alama ya Taifa la Tanzania"
              fill
              className="object-cover object-center mix-blend-screen"
              sizes="96px"
            />
          </div>

          <h1 className="text-2xl font-bold text-white mt-4">
            Kibali cha Kuchukua Mafuta
          </h1>

          <p className="text-sm text-slate-200 mt-1">
            Wizara ya Habari, Utamaduni,
            Sanaa na Michezo
          </p>

        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 border border-white/10 bg-white/85 dark:bg-gray-950/70 backdrop-blur-xl">

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Ingia kwenye Mfumo
          </h2>

          {sessionLoading && (
            <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
              Tunaangalia kikao kilichohifadhiwa...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label className="input-label">
                Barua pepe / Email
              </label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="input-field pl-10"
                  placeholder="mwenyeji@wizara.go.tz"
                  autoComplete="email"
                  required
                />

              </div>

            </div>

            {/* Password */}
            <div>

              <label className="input-label">
                Nenosiri / Password
              </label>

              <div className="relative">

                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="input-field pl-10 pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>

              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                  <span>
                    Inaingia...
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />

                  <span>
                    Ingia
                  </span>
                </>
              )}

            </button>

          </form>

          <div className="mt-6 text-center">

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Hakuna akaunti? Wasiliana na
              Msimamizi
            </p>

          </div>

        </div>

        {/* Footer */}
        <div className="text-center mt-6">

          <p className="text-xs text-slate-300">
            © 2026 Wizara ya Habari,
            Utamaduni, Sanaa na Michezo
          </p>

        </div>

      </motion.div>

    </div>
  )
}
