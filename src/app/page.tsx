'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Fuel, Gauge, ShieldCheck, Workflow } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const workflow = [
  'Mwombaji/Dereva',
  'Mkuu wa Idara',
  'Afisa Usafirishaji',
  'ADA/DAHRM',
  'Ununuzi na Ugavi',
]

export default function HomePage() {
  const { language } = useLanguage()
  const isSw = language === 'sw'

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative flex min-h-screen items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.28),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(12,74,110,0.86),rgba(17,24,39,0.98))]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950 to-transparent" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-8 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="pt-8 md:pt-0"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-cyan-50 backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-teal-300" />
              {isSw ? 'Mfumo wa vibali vya mafuta wa kidigitali' : 'Digital fuel permit workflow'}
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              Kibali cha Kuchukua Mafuta
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
              {isSw
                ? 'Dhibiti maombi, idhini, ukaguzi wa usafirishaji, idhini ya ADA/DAHRM na utoaji wa mafuta kwa njia ya haraka, salama na yenye kumbukumbu.'
                : 'Manage requests, approvals, transport verification, ADA/DAHRM review and fuel issuance through a fast, secure and auditable workflow.'}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-400 px-6 py-3 font-bold text-slate-950 shadow-xl shadow-teal-950/30 transition hover:bg-teal-300"
              >
                {isSw ? 'Ingia kwenye Mfumo' : 'Login'}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#workflow"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                <Workflow className="h-5 w-5" />
                {isSw ? 'Angalia mtiririko' : 'View workflow'}
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
              {[
                { icon: Fuel, value: '5', label: isSw ? 'Hatua' : 'Steps' },
                { icon: Gauge, value: 'PWA', label: isSw ? 'Haraka' : 'Fast' },
                { icon: CheckCircle2, value: 'Audit', label: isSw ? 'Kumbukumbu' : 'Trail' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <item.icon className="mb-2 h-5 w-5 text-teal-300" />
                  <p className="text-xl font-black">{item.value}</p>
                  <p className="text-xs text-slate-300">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.55 }}
            id="workflow"
            className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl md:p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-200">{isSw ? 'Jinsi Mfumo Unavyofanya Kazi' : 'How It Works'}</p>
                <h2 className="text-2xl font-black">{isSw ? 'Mtiririko wa Hatua 5' : 'Five-step flow'}</h2>
              </div>
              <Fuel className="h-9 w-9 text-teal-300" />
            </div>

            <div className="space-y-3">
              {workflow.map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + index * 0.08 }}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-950/45 p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-400 font-black text-slate-950">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold">{step}</p>
                    <p className="text-sm text-slate-300">
                      {isSw ? 'Huthibitisha hatua yake na mfumo huhifadhi muda na mhusika.' : 'Confirms their action while the system records actor and time.'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
