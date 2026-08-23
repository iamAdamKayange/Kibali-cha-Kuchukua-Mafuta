'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Fuel, MoveRight, ChevronDown } from 'lucide-react'

export type WorkflowRole =
  | 'admin'
  | 'mwombaji'
  | 'mkuu-idara'
  | 'afisa-usafirishaji'
  | 'ada-dahrm'
  | 'ununuzi-ugavi'

const steps = [
  {
    role: 'mwombaji',
    title: 'Mwombaji/Dereva',
    action: 'Submit fuel request',
    details: [
      'Jaza fomu kwa taarifa za gari, kilomita, na lita zinazohitajika.',
      'Eleza madhumuni ya safari na muda unaotarajiwa.',
      'Ombi linaingia kwenye mfumo na kupata namba ya kumbukumbu.',
    ],
  },
  {
    role: 'mkuu-idara',
    title: 'Mkuu wa Idara',
    action: 'Approve / Reject',
    details: [
      'Kagua ombi la mwombaji wa idara yake.',
      'Hakiki kuwa safari na kiwango cha mafuta ni halali.',
      'Idhinisha au kataa kwa sababu wazi.',
    ],
  },
  {
    role: 'afisa-usafirishaji',
    title: 'Afisa Usafirishaji',
    action: 'Verify vehicle, logbook and litres',
    details: [
      'Hakiki gari na namba yake kwenye logbook.',
      'Thibitisha kilomita za kuanzia na za sasa.',
      'Amua kiwango sahihi cha lita kulingana na safari.',
    ],
  },
  {
    role: 'ada-dahrm',
    title: 'ADA',
    action: 'Final approval / rejection',
    details: [
      'Kagua idhini za awali kutoka Mkuu wa Idara na Afisa Usafirishaji.',
      'Toa idhini ya mwisho au kataa kwa sababu.',
      'Weka kiwango cha mwisho cha lita zinazopaswa kutolewa.',
    ],
  },
  {
    role: 'ununuzi-ugavi',
    title: 'Ununuzi na Ugavi',
    action: 'Issue fuel and token number',
    details: [
      'Toa mafuta kwa maombi yaliyoidhinishwa na ADA.',
      'Weka token number kwenye mfumo.',
      'Funga ombi baada ya mafuta kutolewa.',
    ],
  },
] as const

const nextActions: Record<WorkflowRole, string> = {
  admin: 'Simamia watumiaji, maombi, takwimu na activity ya mfumo.',
  mwombaji: 'Wasilisha ombi jipya au fuatilia maombi yako.',
  'mkuu-idara': 'Kagua maombi yanayosubiri idhini ya idara.',
  'afisa-usafirishaji': 'Hakiki gari, logbook, kilomita na lita kabla ya kuamua.',
  'ada-dahrm': 'Toa idhini ya mwisho au kataa kwa sababu iliyo wazi.',
  'ununuzi-ugavi': 'Toa mafuta, weka token number na kamilisha ombi.',
}

interface WorkflowGuideProps {
  currentRole: WorkflowRole
}

export function WorkflowGuide({ currentRole }: WorkflowGuideProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  const toggleStep = (role: string) => {
    setExpandedStep((prev) => (prev === role ? null : role))
  }

  return (
    <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">Jinsi Mfumo Unavyofanya Kazi</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mtiririko wa kibali cha kuchukua mafuta</h2>
        </div>
        <div className="rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm dark:border-primary-900/40 dark:bg-primary-900/10">
          <p className="font-semibold text-primary-700 dark:text-primary-300">Hatua yako inayofuata</p>
          <p className="text-gray-700 dark:text-gray-200">{nextActions[currentRole]}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => {
          const isCurrent = step.role === currentRole
          const isAdmin = currentRole === 'admin'
          const isExpanded = expandedStep === step.role

          return (
            <motion.div
              key={step.role}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl border overflow-hidden transition-all duration-200 ${
                isCurrent || isAdmin
                  ? 'border-primary-200 bg-primary-50 dark:border-primary-900/50 dark:bg-primary-900/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/60'
              }`}
            >
              <button
                onClick={() => toggleStep(step.role)}
                className="w-full p-4 text-left hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-black text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    {isCurrent || isAdmin ? (
                      <CheckCircle2 className="h-5 w-5 text-primary-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">{step.title}</p>
                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{step.action}</p>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-200/50 dark:border-gray-800/50"
                  >
                    <ul className="px-4 pb-3 pt-2 space-y-1.5">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Fuel className="h-4 w-4 text-primary-500" />
        Kila hatua huhifadhi mtumiaji, role, tarehe/saa na audit action.
        <MoveRight className="h-4 w-4" />
      </div>
    </section>
  )
}
