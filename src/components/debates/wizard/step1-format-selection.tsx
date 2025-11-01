'use client'

import { useState, useEffect } from 'react'
import { FormatTemplateCard } from '../format-template-card'
import { useDebateModes } from '@/hooks/use-debate-modes'
import type { FormatTemplate, DebateMode, FormatCategory } from '@/types/debate'

interface Step1FormatSelectionProps {
  selectedTemplateId: string | null
  onSelect: (templateId: string | null) => void
}

export function Step1FormatSelection({ selectedTemplateId, onSelect }: Step1FormatSelectionProps) {
  const { data: modesData } = useDebateModes({ pageSize: 100 })
  const [templates, setTemplates] = useState<FormatTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<FormatCategory | 'ALL'>('ALL')
  const [modeFilter, setModeFilter] = useState<DebateMode | 'ALL'>('ALL')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter)
      if (modeFilter !== 'ALL') params.append('mode', modeFilter)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/format-templates?${params}`)
      if (!response.ok) throw new Error('Failed to fetch templates')

      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTemplates()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, categoryFilter, modeFilter])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Choose a Format Template
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Select a preset template to get started quickly, or skip to create a custom debate from scratch.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="block w-full rounded-md bg-white px-3 py-1.5 pr-10 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                  <span className="sr-only">Clear search</span>
                </button>
              ) : (
                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as FormatCategory | 'ALL')}
            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="ACADEMIC">Academic</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="CASUAL">Casual</option>
            <option value="CULTURAL">Cultural</option>
          </select>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
          >
            <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="grid grid-cols-1">
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as DebateMode | 'ALL')}
            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          >
            <option value="ALL">All Modes</option>
            {modesData?.modes.map((mode) => {
              // Map mode slug to enum value for filter compatibility
              const enumValue = mode.slug === 'podcast-mode' ? 'PODCAST' : 'DEBATE'
              return (
                <option key={mode.id} value={enumValue}>
                  {mode.name}
                </option>
              )
            })}
          </select>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
          >
            <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Custom Debate Option */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`relative w-full rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          selectedTemplateId === null
            ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-500/10'
            : 'border-gray-300 hover:border-gray-400 dark:border-white/10 dark:hover:border-white/20'
        }`}
      >
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          Start with Custom Format
        </div>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Create a debate from scratch without using a template
        </div>

        {/* Selected Indicator */}
        {selectedTemplateId === null && (
          <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center dark:bg-indigo-500">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </button>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-500"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No templates found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {templates.map((template) => (
            <FormatTemplateCard
              key={template.id}
              template={template}
              selected={selectedTemplateId === template.id}
              onSelect={() => onSelect(template.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
