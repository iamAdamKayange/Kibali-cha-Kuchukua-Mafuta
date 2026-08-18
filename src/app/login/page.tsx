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
    <div className="relative min-h-screen overflow-hidden bg-transparent p-4 text-gray-900 transition-colors duration-300 dark:text-white">
      {/*
        The national-emblem watermark itself now lives in <BrandWatermark />,
        rendered once (globally) by AppExperience — the same layer that
        sits behind every other screen. Previously this page painted its
        own extra copy on top with an unconditional `mix-blend-screen`,
        which is why it looked fine here but (a) doubled up oddly on this
        screen only, and (b) nearly disappeared in light mode, since
        screen-blending a graphic against a light backdrop pushes it
        toward white. Keeping only the soft gradient wash below lets the
        shared watermark show through consistently, on every theme.
      */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(240,249,255,0.82),rgba(255,255,255,0.92))] dark:bg-[linear-gradient(135deg,rgba(2,6,23,0.95),rgba(8,47,73,0.76),rgba(2,6,23,0.95))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(20,184,166,0.08),transparent_30%)] dark:bg-[radial-gradient(circle_at_75%_20%,rgba(20,184,166,0.12),transparent_30%)]" />

      <div className="relative z-10 flex min-h-[calc(100vh-2rem)] items-center justify-center">
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
        className="w-full max-w-md"
      >

        {/* Logo */}
        <div className="text-center mb-8">

          <motion.div
            initial={{ opacity: 0, y: -8, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ rotateY: 8, rotateX: -4, scale: 1.03 }}
            style={{ transformPerspective: 800 }}
            className="relative mx-auto h-24 w-24 overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-2 shadow-[0_18px_35px_-10px_rgba(15,23,42,0.35)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_18px_35px_-10px_rgba(0,0,0,0.6)]"
          >
            <Image
              src="/assets/tanzania-emblem.png"
              alt="Alama ya Taifa la Tanzania"
              fill
              className="object-contain object-center p-1 drop-shadow-[0_6px_10px_rgba(15,23,42,0.25)] dark:mix-blend-screen"
              sizes="96px"
            />
          </motion.div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Kibali cha Kuchukua Mafuta
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Wizara ya Habari, Utamaduni,
            Sanaa na Michezo
          </p>

        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl border border-white/50 bg-white/90 p-8 shadow-2xl shadow-gray-900/10 backdrop-blur-xl dark:border-gray-800/70 dark:bg-gray-950/70 dark:shadow-black/30">

          <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
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
        <div className="mt-6 text-center">

          <p className="text-xs text-slate-300">
            © 2026 Wizara ya Habari,
            Utamaduni, Sanaa na Michezo
          </p>

        </div>

      </motion.div>
      </div>

    </div>
  )
}
