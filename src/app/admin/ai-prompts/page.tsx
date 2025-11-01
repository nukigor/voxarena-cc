'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Pagination } from '@/components/ui/pagination'
import { AiPromptLog, AiPromptStatus } from '@/types/ai-prompt-log'
import { ChevronDownIcon as ChevronDownIcon16, ChevronUpIcon } from '@heroicons/react/16/solid'
import { ChevronDownIcon as ChevronDownIcon20 } from '@heroicons/react/20/solid'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function getStatusBadge(status: AiPromptStatus) {
  const styles = {
    SUCCESS: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20',
    FAILED: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
    PARTIAL: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20',
  }
  return styles[status] || styles.FAILED
}

function formatDate(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCost(cost: number | null) {
  if (cost === null) return 'N/A'
  return `$${cost.toFixed(4)}`
}

export default function AiPromptsPage() {
  const [logs, setLogs] = useState<AiPromptLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 20

  // Filters
  const [functionality, setFunctionality] = useState('')
  const [parentModel, setParentModel] = useState('')
  const [status, setStatus] = useState<string>('')
  const [availableFunctionalities, setAvailableFunctionalities] = useState<string[]>([])
  const [availableParentModels, setAvailableParentModels] = useState<string[]>([])

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })

      if (functionality) params.append('functionality', functionality)
      if (parentModel) params.append('parentModel', parentModel)
      if (status) params.append('status', status)

      const response = await fetch(`/api/ai-prompt-logs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch logs')

      const data = await response.json()
      setLogs(data.logs)
      setTotal(data.pagination.total)
      setTotalPages(data.pagination.totalPages)
      setAvailableFunctionalities(data.filters.functionalities)
      setAvailableParentModels(data.filters.parentModels)
    } catch (error) {
      console.error('Error fetching AI prompt logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, functionality, parentModel, status])

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }


  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">AI Prompts</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            View and monitor all AI prompts executed by the application
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Functionality Filter */}
        <div className="relative sm:max-w-xs flex-1 grid grid-cols-1">
          <select
            id="functionality"
            value={functionality}
            onChange={(e) => {
              setFunctionality(e.target.value)
              setPage(1)
            }}
            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          >
            <option value="">All Functionalities</option>
            {availableFunctionalities.map((func) => (
              <option key={func} value={func}>
                {func}
              </option>
            ))}
          </select>
          <ChevronDownIcon16
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
          />
        </div>

        {/* Parent Model Filter */}
        <div className="relative sm:max-w-xs flex-1 grid grid-cols-1">
          <select
            id="parentModel"
            value={parentModel}
            onChange={(e) => {
              setParentModel(e.target.value)
              setPage(1)
            }}
            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          >
            <option value="">All Parent Models</option>
            {availableParentModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <ChevronDownIcon16
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
          />
        </div>

        {/* Status Filter */}
        <div className="relative sm:max-w-xs flex-1 grid grid-cols-1">
          <select
            id="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="PARTIAL">Partial</option>
          </select>
          <ChevronDownIcon16
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg dark:ring-white/10">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-white/10">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                      Date/Time
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Functionality
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Parent
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Model
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Time/Tokens
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Expand</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-white/10 dark:bg-gray-900">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No AI prompt logs found
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <React.Fragment key={log.id}>
                        <tr className="hover:bg-gray-50 dark:hover:bg-white/5">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 dark:text-white sm:pl-6">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                            {log.functionality}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 dark:text-white">
                            <div className="font-medium">{log.parentModel}</div>
                            <div className="text-gray-500 dark:text-gray-400">{log.parentObjectName}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {log.aiModel}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={classNames(
                              'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                              getStatusBadge(log.status)
                            )}>
                              {log.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <div>{log.executionTimeMs ? `${log.executionTimeMs}ms` : 'N/A'}</div>
                            <div className="text-xs">{log.tokenUsage ? `${log.tokenUsage} tokens` : ''}</div>
                            <div className="text-xs text-green-600 dark:text-green-400">{formatCost(log.estimatedCost)}</div>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => toggleRow(log.id)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              {expandedRows.has(log.id) ? (
                                <ChevronUpIcon className="h-5 w-5" />
                              ) : (
                                <ChevronDownIcon20 className="h-5 w-5" />
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedRows.has(log.id) && (
                          <tr>
                            <td colSpan={7} className="px-4 py-6 bg-gray-50 dark:bg-white/5">
                              <div className="space-y-6">
                                {/* Prompt */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Prompt</h4>
                                  <pre className="text-xs bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-white/10 overflow-x-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                    {log.prompt}
                                  </pre>
                                </div>

                                {/* Result */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Result</h4>
                                  <pre className="text-xs bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-white/10 overflow-x-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                    {log.result || 'No result'}
                                  </pre>
                                </div>

                                {/* Explanation */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Prompt Construction Explanation</h4>
                                  <pre className="text-xs bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-white/10 overflow-x-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                    {log.promptExplanation}
                                  </pre>
                                </div>

                                {/* Error Message */}
                                {log.errorMessage && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Error Message</h4>
                                    <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-500/20 overflow-x-auto whitespace-pre-wrap text-red-700 dark:text-red-300">
                                      {log.errorMessage}
                                    </pre>
                                  </div>
                                )}

                                {/* Metadata */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Parent Object ID:</span>
                                    <span className="ml-2 text-gray-600 dark:text-gray-400">{log.parentObjectId}</span>
                                  </div>
                                  {log.parentObjectSlug && (
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Slug:</span>
                                      <span className="ml-2 text-gray-600 dark:text-gray-400">{log.parentObjectSlug}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && logs.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={pageSize}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
