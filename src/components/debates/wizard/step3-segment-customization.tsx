'use client'

import { SegmentEditor } from '../segment-editor'
import { useDebateModes } from '@/hooks/use-debate-modes'
import type { DebateBuilderStep3Data, SegmentStructure, FormatTemplateWithRelations } from '@/types/debate'

interface Step3SegmentCustomizationProps {
  data: DebateBuilderStep3Data
  onChange: (data: DebateBuilderStep3Data) => void
  selectedTemplate?: FormatTemplateWithRelations | null
}

export function Step3SegmentCustomization({ data, onChange, selectedTemplate }: Step3SegmentCustomizationProps) {
  const { data: modesData, isLoading: modesLoading, isError: modesError } = useDebateModes({ pageSize: 100 })
  const isCustomFormat = !selectedTemplate

  const updateSegments = (segments: SegmentStructure) => {
    onChange({ ...data, segments })
  }

  const updateTiming = (flexibleTiming: boolean) => {
    onChange({ ...data, flexibleTiming })
  }

  const updateMinParticipants = (value: number) => {
    onChange({ ...data, minParticipants: value })
  }

  const updateMaxParticipants = (value: number) => {
    onChange({ ...data, maxParticipants: value })
  }

  const updateRequiresModerator = (value: boolean) => {
    onChange({ ...data, requiresModerator: value })
  }

  const updateTotalDuration = (value: number | undefined) => {
    onChange({ ...data, totalDurationMinutes: value })
  }

  const updateModeId = (value: string) => {
    onChange({ ...data, modeId: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Customize Segments
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {isCustomFormat
            ? 'Define the structure and flow of your debate. Add, remove, or reorder segments as needed.'
            : 'Review the debate segments. You can only modify segment durations for template-based formats.'
          }
        </p>
      </div>

      {/* Template Enforcement Banner - show when template selected */}
      {!isCustomFormat && selectedTemplate && (
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-blue-600 mt-0.5 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Template-Based Format: "{selectedTemplate.name}"
              </h4>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                This debate uses a predefined format. Mode and segment structure are locked to maintain template integrity. You can only modify segment durations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Format Configuration - only show when no template selected */}
      {isCustomFormat && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-white/10 dark:bg-gray-800/50">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Format Configuration
          </h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="minParticipants" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                Min Participants
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  id="minParticipants"
                  min="1"
                  value={data.minParticipants || 2}
                  onChange={(e) => updateMinParticipants(parseInt(e.target.value) || 1)}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="maxParticipants" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                Max Participants
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  id="maxParticipants"
                  min="1"
                  value={data.maxParticipants || 10}
                  onChange={(e) => updateMaxParticipants(parseInt(e.target.value) || 1)}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="totalDuration" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                Target Duration (minutes)
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  id="totalDuration"
                  min="1"
                  value={data.totalDurationMinutes || ''}
                  onChange={(e) => updateTotalDuration(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Optional"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave empty for no constraint
              </p>
            </div>

            <div className="sm:col-span-3">
              <div className="flex items-center gap-3 mt-8">
                <input
                  type="checkbox"
                  id="requiresModerator"
                  checked={data.requiresModerator || false}
                  onChange={(e) => updateRequiresModerator(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-500"
                />
                <label htmlFor="requiresModerator" className="text-sm/6 font-medium text-gray-900 dark:text-white">
                  Requires Moderator
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Mode <span className="text-red-600 dark:text-red-400">*</span>
        </label>

        {modesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 dark:border-gray-600 dark:border-t-indigo-500"></div>
          </div>
        ) : modesError ? (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-400">
              Failed to load debate modes. Please try again.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {modesData?.modes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => isCustomFormat && updateModeId(mode.id)}
                disabled={!isCustomFormat}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  data.modeId === mode.id
                    ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-500/10'
                    : 'border-gray-300 dark:border-white/10'
                } ${
                  !isCustomFormat
                    ? 'cursor-not-allowed opacity-60'
                    : 'hover:border-gray-400 dark:hover:border-white/20 cursor-pointer'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {mode.name}
                </div>
                {mode.teaser && (
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {mode.teaser}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Flexible Timing Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-white/10">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Flexible Timing
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Allow AI to adjust segment durations dynamically
          </div>
        </div>
        <button
          type="button"
          onClick={() => updateTiming(!data.flexibleTiming)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:focus:ring-indigo-500 dark:focus:ring-offset-gray-900 ${
            data.flexibleTiming
              ? 'bg-indigo-600 dark:bg-indigo-500'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              data.flexibleTiming ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Segment Editor */}
      <SegmentEditor
        segments={data.segments}
        onChange={updateSegments}
        totalDurationMinutes={data.flexibleTiming ? undefined : data.totalDurationMinutes}
        readOnlyMode={!isCustomFormat}
        templateName={selectedTemplate?.name}
      />
    </div>
  )
}
