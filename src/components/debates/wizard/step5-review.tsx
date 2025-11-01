'use client'

import { formatDistanceToNow } from 'date-fns'
import type { DebateBuilderData, FormatTemplate } from '@/types/debate'
import { useDebateModes } from '@/hooks/use-debate-modes'

interface Step5ReviewProps {
  data: DebateBuilderData
  selectedTemplate: FormatTemplate | null
}

const ROLE_LABELS: Record<string, string> = {
  DEBATER: 'Debater',
  MODERATOR: 'Moderator',
  EXPERT: 'Expert',
  HOST: 'Host',
  JUDGE: 'Judge',
}

export function Step5Review({ data, selectedTemplate }: Step5ReviewProps) {
  const step2 = data.step2!
  const step3 = data.step3!
  const step4 = data.step4!

  // Fetch mode name from Mode database
  const { data: modesData } = useDebateModes({ pageSize: 100 })
  const selectedMode = modesData?.modes.find(m => m.id === step3.modeId)

  const totalDuration = step3.segments.reduce((sum, seg) => sum + seg.durationMinutes, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Review & Create
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Review your debate configuration before creating.
        </p>
      </div>

      <div className="space-y-6">
        {/* Format Template or Custom Configuration */}
        {selectedTemplate ? (
          <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Format Template
            </h3>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {selectedTemplate.name}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {selectedTemplate.description}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Custom Format
            </h3>
            <dl className="mt-2 space-y-2">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Min Participants</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{step3.minParticipants || 2}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Max Participants</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{step3.maxParticipants || 10}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Moderator Required</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{step3.requiresModerator ? 'Yes' : 'No'}</dd>
                </div>
              </div>
              {step3.totalDurationMinutes && (
                <div className="mt-2">
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Target Duration</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{step3.totalDurationMinutes} minutes</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Debate Details */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Debate Details
          </h3>
          <dl className="mt-2 space-y-2">
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Title</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{step2.title}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Topic</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{step2.topic}</dd>
            </div>
            {step2.description && (
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{step2.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Mode</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-400/10 dark:text-blue-400">
                  {selectedMode?.name || 'Loading...'}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Segments */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Segments ({step3.segments.length})
            </h3>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total: {totalDuration} min
              {step3.flexibleTiming && ' (flexible)'}
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {step3.segments.map((segment, index) => (
              <div
                key={segment.key}
                className="flex items-start justify-between rounded bg-gray-50 p-2 dark:bg-white/5"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {index + 1}. {segment.title}
                  </div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {segment.description}
                  </div>
                </div>
                <div className="ml-4 text-xs text-gray-600 dark:text-gray-400">
                  {segment.durationMinutes} min
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Participants */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Participants ({step4.participants.length})
          </h3>
          <div className="mt-3 space-y-2">
            {step4.participants.map((participant, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded bg-gray-50 p-2 dark:bg-white/5"
              >
                <div className="text-sm text-gray-900 dark:text-white">
                  Participant {index + 1}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {ROLE_LABELS[participant.role]}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    (Order: {participant.speakingOrder})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-500/10">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            Your debate will be created in <strong>DRAFT</strong> status. You can edit it later or generate the content when ready.
          </div>
        </div>
      </div>
    </div>
  )
}
