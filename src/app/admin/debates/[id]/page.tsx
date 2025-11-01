'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { TranscriptDisplay } from '@/components/debates/transcript-display'
import {
  ArrowLeftIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUturnLeftIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/20/solid'
import { formatFileSize, getFileTypeDisplay } from '@/lib/r2/document-upload'
import type { Debate } from '@/types/debate'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

const STATUS_STYLES = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-400/10 dark:text-gray-400',
  GENERATING: 'bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-400',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-400/10 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-400',
  PUBLISHED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-400/10 dark:text-indigo-400',
}


const ROLE_LABELS = {
  DEBATER: 'Debater',
  MODERATOR: 'Moderator',
  EXPERT: 'Expert',
  HOST: 'Host',
  JUDGE: 'Judge',
}

export default function DebateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [debate, setDebate] = useState<Debate | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [reverting, setReverting] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingWord, setExportingWord] = useState(false)
  const [showRevertDialog, setShowRevertDialog] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [debateId, setDebateId] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => {
      setDebateId(p.id)
    })
  }, [params])

  useEffect(() => {
    if (debateId) {
      fetchDebate()
    }
  }, [debateId])

  const fetchDebate = async () => {
    if (!debateId) return
    try {
      const response = await fetch(`/api/debates/${debateId}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/admin/debates')
          return
        }
        throw new Error('Failed to fetch debate')
      }

      const data = await response.json()
      setDebate(data)
    } catch (error) {
      console.error('Error fetching debate:', error)
      alert('Failed to load debate')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!debate || debate.status !== 'DRAFT' || !debateId) return

    setGenerating(true)
    try {
      const response = await fetch(`/api/debates/${debateId}/generate`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate debate')
      }

      await fetchDebate()
      setShowGenerateDialog(false)
    } catch (error: any) {
      console.error('Error generating debate:', error)
      alert(error.message || 'Failed to generate debate')
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!debateId) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/debates/${debateId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete debate')
      }

      router.push('/admin/debates')
    } catch (error: any) {
      console.error('Error deleting debate:', error)
      alert(error.message || 'Failed to delete debate')
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handlePublish = async () => {
    if (!debateId) return

    setPublishing(true)
    try {
      const response = await fetch(`/api/debates/${debateId}/publish`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to publish debate')
      }

      await fetchDebate()
      setShowPublishDialog(false)
    } catch (error: any) {
      console.error('Error publishing debate:', error)
      alert(error.message || 'Failed to publish debate')
    } finally {
      setPublishing(false)
    }
  }

  const handleRevertToDraft = async () => {
    if (!debateId) return

    setReverting(true)
    try {
      const response = await fetch(`/api/debates/${debateId}/revert-to-draft`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to revert debate to draft')
      }

      await fetchDebate()
      setShowRevertDialog(false)
    } catch (error: any) {
      console.error('Error reverting debate to draft:', error)
      alert(error.message || 'Failed to revert debate to draft')
    } finally {
      setReverting(false)
    }
  }

  const handleExportPdf = async () => {
    if (!debateId) return

    setExportingPdf(true)
    try {
      const response = await fetch(`/api/debates/${debateId}/export-pdf`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to export PDF')
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'transcript.pdf'

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      console.error('Error exporting PDF:', error)
      alert(error.message || 'Failed to export PDF')
    } finally {
      setExportingPdf(false)
    }
  }

  const handleExportWord = async () => {
    if (!debateId) return

    setExportingWord(true)
    try {
      const response = await fetch(`/api/debates/${debateId}/export-word`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to export Word document')
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'transcript.docx'

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      console.error('Error exporting Word document:', error)
      alert(error.message || 'Failed to export Word document')
    } finally {
      setExportingWord(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-500"></div>
      </div>
    )
  }

  if (!debate) {
    return null
  }

  const totalDuration = debate.totalDurationMinutes || 0
  const segmentStructure = debate.segmentStructure as any[] || []

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/debates"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Debates
          </Link>

          <div className="mt-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {debate.title}
              </h1>
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                  STATUS_STYLES[debate.status]
                }`}
              >
                {debate.status}
                {debate.status === 'GENERATING' && (
                  <span className="ml-2 h-2 w-2 animate-pulse rounded-full bg-current"></span>
                )}
              </span>
              {debate.debateMode && (
                <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-400/10 dark:text-blue-400">
                  {debate.debateMode.name}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Created {formatDistanceToNow(new Date(debate.createdAt))} ago
            </p>
          </div>
        </div>

        {/* Error Message */}
        {debate.status === 'FAILED' && debate.errorMessage && (
          <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-500/10">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Generation Failed
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {debate.errorMessage}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Topic */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Topic
              </h2>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                {debate.topic}
              </p>
            </div>

            {/* Description */}
            {debate.description && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Description
                </h2>
                <div className="mt-2 prose prose-base prose-gray max-w-none dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      ul: ({ children }) => <ul className="list-disc list-outside ml-6" style={{ listStylePosition: 'outside' }}>{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-outside ml-6" style={{ listStylePosition: 'outside' }}>{children}</ol>,
                    }}
                  >
                    {debate.description}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Segments */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Segments ({segmentStructure.length})
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {totalDuration} min
                  {debate.flexibleTiming && ' (flexible)'}
                </div>
              </div>
              <div className="space-y-3">
                {segmentStructure.map((segment: any, index: number) => (
                  <div
                    key={segment.key}
                    className="rounded-lg border border-gray-200 p-4 dark:border-white/10"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {index + 1}. {segment.title}
                          {segment.required && (
                            <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                              *Required
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {segment.description}
                        </p>
                      </div>
                      <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                        {segment.durationMinutes} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transcript */}
            {debate.transcript && debate.transcript.trim().length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Transcript
                  </h2>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      disabled={exportingPdf}
                      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                    >
                      {exportingPdf ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                          Export PDF
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportWord}
                      disabled={exportingWord}
                      className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
                    >
                      {exportingWord ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                          Export Word
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <TranscriptDisplay transcript={debate.transcript} />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Edit Button */}
              {debate.status === 'DRAFT' && debateId && (
                <Link
                  href={`/admin/debates/${debateId}/edit`}
                  className="w-full inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20"
                >
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              )}

              {/* Publish Button */}
              {debate.status === 'COMPLETED' && (
                <button
                  type="button"
                  onClick={() => setShowPublishDialog(true)}
                  disabled={publishing}
                  className="w-full inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-400"
                >
                  {publishing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="mr-2 h-4 w-4" />
                      Publish
                    </>
                  )}
                </button>
              )}

              {/* Revert to Draft Button */}
              {(debate.status === 'COMPLETED' || debate.status === 'PUBLISHED') && (
                <button
                  type="button"
                  onClick={() => setShowRevertDialog(true)}
                  disabled={reverting}
                  className="w-full inline-flex items-center justify-center rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-yellow-500 dark:hover:bg-yellow-400"
                >
                  {reverting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Reverting...
                    </>
                  ) : (
                    <>
                      <ArrowUturnLeftIcon className="mr-2 h-4 w-4" />
                      Revert to Draft
                    </>
                  )}
                </button>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={deleting}
                className="w-full inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-400"
              >
                {deleting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </button>

              {/* Generate Button */}
              {debate.status === 'DRAFT' && (
                <button
                  type="button"
                  onClick={() => setShowGenerateDialog(true)}
                  disabled={generating}
                  className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                  {generating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Debate Format */}
            {debate.formatTemplate && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Debate Format
                </h2>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {debate.formatTemplate.name}
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {debate.formatTemplate.description}
                </p>
              </div>
            )}

            {/* Debate Mode */}
            {debate.debateMode && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Debate Mode
                </h2>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {debate.debateMode.name}
                </div>
                {debate.debateMode.teaser && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {debate.debateMode.teaser}
                  </p>
                )}
              </div>
            )}

            {/* Participants */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Participants ({debate.participants.length})
              </h2>
              <div className="space-y-3">
                {debate.participants
                  .sort((a, b) => (a.speakingOrder || 0) - (b.speakingOrder || 0))
                  .map((participant) => (
                    <Link
                      key={participant.id}
                      href={`/admin/personas/${participant.persona.id}`}
                      className="flex items-center gap-3 rounded-md p-2 -m-2 hover:bg-gray-50 transition-colors dark:hover:bg-gray-700/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                        {participant.persona.avatarUrl ? (
                          <img
                            src={participant.persona.avatarUrl}
                            alt={participant.persona.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {participant.persona.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {participant.persona.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {ROLE_LABELS[participant.role]} • Order {participant.speakingOrder}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>

            {/* Review Document - for formats that allow document upload */}
            {debate.reviewDocumentUrl && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Review Document
                </h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md dark:bg-gray-700/30">
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {debate.reviewDocumentName || 'Document'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {debate.reviewDocumentSize && formatFileSize(debate.reviewDocumentSize)} • {debate.reviewDocumentType && getFileTypeDisplay(debate.reviewDocumentType)}
                      </p>
                    </div>
                  </div>
                  <a
                    href={debate.reviewDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download
                  </a>
                </div>
              </div>
            )}

            {/* Audio */}
            {debate.audioUrl && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Audio
                </h2>
                <audio controls className="w-full">
                  <source src={debate.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                {debate.duration && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Duration: {Math.floor(debate.duration / 60)}:{String(debate.duration % 60).padStart(2, '0')}
                  </p>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Metadata
              </h2>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">ID</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white font-mono text-xs">
                    {debate.id}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Created</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {new Date(debate.createdAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Updated</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {new Date(debate.updatedAt).toLocaleString()}
                  </dd>
                </div>
                {debate.publishedAt && (
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">Published</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {new Date(debate.publishedAt).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Confirmation Dialog */}
      <ConfirmDialog
        open={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        onConfirm={handlePublish}
        title="Publish Debate"
        message="Are you sure you want to publish this debate? Once published, the debate will be available to the public."
        confirmText="Publish"
        cancelText="Cancel"
        variant="success"
        isLoading={publishing}
      />

      {/* Revert to Draft Confirmation Dialog */}
      <ConfirmDialog
        open={showRevertDialog}
        onClose={() => setShowRevertDialog(false)}
        onConfirm={handleRevertToDraft}
        title="Revert to Draft"
        message="Are you sure you want to revert this debate to draft? This will delete all generated content including the transcript, audio, and any other generated data. This action cannot be undone."
        confirmText="Revert to Draft"
        cancelText="Cancel"
        variant="warning"
        isLoading={reverting}
      />

      {/* Generate Confirmation Dialog */}
      <ConfirmDialog
        open={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        onConfirm={handleGenerate}
        title="Generate Debate"
        message="Are you sure you want to generate this debate? This will create a placeholder transcript based on the debate configuration."
        confirmText="Generate"
        cancelText="Cancel"
        variant="success"
        isLoading={generating}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Debate"
        message="Are you sure you want to delete this debate? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  )
}
