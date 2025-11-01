'use client'

import type { DebateBuilderStep2Data } from '@/types/debate'
import { MarkdownEditor } from '@/components/ui/markdown-editor'

interface Step2DebateDetailsProps {
  data: DebateBuilderStep2Data
  onChange: (data: DebateBuilderStep2Data) => void
}

export function Step2DebateDetails({ data, onChange }: Step2DebateDetailsProps) {

  const updateField = (field: keyof DebateBuilderStep2Data, value: any) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Debate Details
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Provide basic information about your debate.
        </p>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-900 dark:text-white">
            Title <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={data.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g., The Future of AI Governance"
            className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
          />
        </div>

        {/* Topic */}
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-900 dark:text-white">
            Topic <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <textarea
            id="topic"
            value={data.topic}
            onChange={(e) => updateField('topic', e.target.value)}
            rows={3}
            placeholder="Describe the main topic or question to be debated..."
            className="mt-2 block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <MarkdownEditor
            value={data.description || ''}
            onChange={(value) => updateField('description', value)}
            label="Description"
            placeholder="Additional context or goals for this debate..."
            rows={6}
            optional
          />
        </div>

      </div>
    </div>
  )
}
