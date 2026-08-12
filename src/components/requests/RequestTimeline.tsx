'use client'

import { CheckCircle, Circle, XCircle, Clock, Loader2 } from 'lucide-react'

interface TimelineStep {
  label: string
  status: 'completed' | 'current' | 'pending' | 'rejected'
  user?: string
  date?: string
  reason?: string
}

interface RequestTimelineProps {
  steps: TimelineStep[]
}

export function RequestTimeline({ steps }: RequestTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

      <div className="space-y-6">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed'
          const isCurrent = step.status === 'current'
          const isPending = step.status === 'pending'
          const isRejected = step.status === 'rejected'

          return (
            <div key={index} className="relative flex gap-4 pl-10">
              {/* Icon */}
              <div className="absolute left-0 top-0">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2
                  ${isCompleted ? 'bg-success-500 border-success-500 text-white' : ''}
                  ${isCurrent ? 'bg-primary-500 border-primary-500 text-white animate-pulse' : ''}
                  ${isPending ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400' : ''}
                  ${isRejected ? 'bg-danger-500 border-danger-500 text-white' : ''}
                `}>
                  {isCompleted && <CheckCircle className="w-4 h-4" />}
                  {isCurrent && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isPending && <Circle className="w-4 h-4" />}
                  {isRejected && <XCircle className="w-4 h-4" />}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className={`font-medium ${
                    isPending ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                  }`}>
                    {step.label}
                  </h4>
                  <span className={`text-xs ${
                    isCompleted ? 'text-success-600 dark:text-success-400' : ''
                  } ${isCurrent ? 'text-primary-600 dark:text-primary-400' : ''}
                  ${isPending ? 'text-gray-400 dark:text-gray-500' : ''}
                  ${isRejected ? 'text-danger-600 dark:text-danger-400' : ''}`}>
                    {isCompleted ? 'Imekamilika' : ''}
                    {isCurrent ? 'Inasubiri' : ''}
                    {isPending ? 'Inasubiri' : ''}
                    {isRejected ? 'Imekataliwa' : ''}
                  </span>
                </div>

                {step.user && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {step.user}
                  </p>
                )}
                {step.date && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {step.date}
                  </p>
                )}
                {step.reason && (
                  <p className="text-sm text-danger-600 dark:text-danger-400 mt-2 bg-danger-50 dark:bg-danger-900/20 p-2 rounded-lg">
                    Sababu: {step.reason}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}