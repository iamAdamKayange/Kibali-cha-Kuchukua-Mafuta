'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Fuel, MoveRight } from 'lucide-react'

export type WorkflowRole =
  | 'admin'
  | 'mwombaji'
  | 'mkuu-idara'
  | 'afisa-usafirishaji'
  | 'ada-dahrm'
  | 'ununuzi-ugavi'

const steps = [
  { role: 'mwombaji', title: 'Mwombaji/Dereva', action: 'Submit fuel request' },
  { role: 'mkuu-idara', title: 'Mkuu wa Idara', action: 'Approve / Reject' },
  { role: 'afisa-usafirishaji', title: 'Afisa Usafirishaji', action: 'Verify vehicle, logbook and litres' },
  { role: 'ada-dahrm', title: 'ADA', action: 'Final approval / rejection' },
  { role: 'ununuzi-ugavi', title: 'Ununuzi na Ugavi', action: 'Issue fuel and token number' },
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

          return (
            <motion.div
              key={step.role}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl border p-4 ${
                isCurrent || isAdmin
                  ? 'border-primary-200 bg-primary-50 dark:border-primary-900/50 dark:bg-primary-900/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/60'
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-black text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white">
                  {index + 1}
                </span>
                {isCurrent || isAdmin ? (
                  <CheckCircle2 className="h-5 w-5 text-primary-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">{step.title}</p>
              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{step.action}</p>
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
