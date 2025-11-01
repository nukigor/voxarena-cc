'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DebateWithRelations, SegmentStructure, ParticipantRole } from '@/types/debate'
import { SegmentEditor } from '@/components/debates/segment-editor'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MarkdownEditor } from '@/components/ui/markdown-editor'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { useDebateModes } from '@/hooks/use-debate-modes'
import { DocumentUploadSection } from '@/components/debates/document-upload-section'
// Drift detection imports disabled - now using template enforcement approach
// import { FormatDriftAnalysis } from '@/types/debate'
// import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
// import { calculateFormatDrift } from '@/lib/format-drift-detector'

interface Persona {
  id: string
  name: string
  nickname?: string
  avatarUrl?: string
}

interface DebateParticipant {
  personaId: string
  role: ParticipantRole
  speakingOrder: number
}

export default function EditDebatePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { data: modesData, isLoading: modesLoading } = useDebateModes({ pageSize: 100 })
  const [debateId, setDebateId] = useState<string | null>(null)
  const [debate, setDebate] = useState<DebateWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [modeId, setModeId] = useState<string>('')
  const [segments, setSegments] = useState<SegmentStructure>([])
  const [totalDurationMinutes, setTotalDurationMinutes] = useState(60)
  const [flexibleTiming, setFlexibleTiming] = useState(true)
  const [participants, setParticipants] = useState<DebateParticipant[]>([])

  // Participant management state
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loadingPersonas, setLoadingPersonas] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [minParticipants, setMinParticipants] = useState(2)
  const [maxParticipants, setMaxParticipants] = useState(10)
  const [requiresModerator, setRequiresModerator] = useState(false)

  // Template enforcement state
  const [isTemplateBasedDebate, setIsTemplateBasedDebate] = useState(false)
  const [showConvertDialog, setShowConvertDialog] = useState(false)

  // Document upload state
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentName, setDocumentName] = useState<string | null>(null)
  const [documentSize, setDocumentSize] = useState<number | null>(null)
  const [documentType, setDocumentType] = useState<string | null>(null)
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [isExpertReviewPanel, setIsExpertReviewPanel] = useState(false)

  // Unwrap params for Next.js 15
  useEffect(() => {
    params.then((p) => {
      setDebateId(p.id)
    })
  }, [params])

  // Fetch debate data
  useEffect(() => {
    if (!debateId) return

    const fetchDebate = async () => {
      try {
        const response = await fetch(`/api/debates/${debateId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch debate')
        }
        const data = await response.json()

        // Check if debate can be edited (only DRAFT status)
        if (data.status !== 'DRAFT') {
          setError('Only draft debates can be edited')
          setLoading(false)
          return
        }

        setDebate(data)
        setTitle(data.title)
        setTopic(data.topic)
        setDescription(data.description || '')
        setModeId(data.modeId || '')
        setSegments((data.segmentStructure as SegmentStructure) || [])
        setTotalDurationMinutes(data.totalDurationMinutes || 60)
        setFlexibleTiming(data.flexibleTiming ?? true)

        // Initialize participants
        const debateParticipants: DebateParticipant[] = data.participants.map((p: any) => ({
          personaId: p.personaId,
          role: p.role,
          speakingOrder: p.speakingOrder || 1,
        }))
        setParticipants(debateParticipants)

        // Set constraints from format template or defaults
        if (data.formatTemplate) {
          setMinParticipants(data.formatTemplate.minParticipants || 2)
          setMaxParticipants(data.formatTemplate.maxParticipants || 10)
          setRequiresModerator(data.formatTemplate.requiresModerator || false)
        } else {
          setMinParticipants(2)
          setMaxParticipants(10)
          setRequiresModerator(false)
        }

        // Check if this is a template-based debate
        setIsTemplateBasedDebate(!!data.formatTemplateId)

        // Check if this format allows document upload
        setIsExpertReviewPanel(data.formatTemplate?.allowsDocumentUpload || false)

        // Load document information if available
        setDocumentUrl(data.reviewDocumentUrl || null)
        setDocumentName(data.reviewDocumentName || null)
        setDocumentSize(data.reviewDocumentSize || null)
        setDocumentType(data.reviewDocumentType || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDebate()
  }, [debateId])

  // Fetch personas for participant selection
  useEffect(() => {
    fetchPersonas()
  }, [searchQuery])

  const fetchPersonas = async () => {
    try {
      setLoadingPersonas(true)
      const params = new URLSearchParams({
        pageSize: '100',
        status: 'ACTIVE'
      })
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/personas?${params}`)
      if (!response.ok) throw new Error('Failed to fetch personas')

      const responseData = await response.json()
      setPersonas(responseData.personas || [])
    } catch (error) {
      console.error('Error fetching personas:', error)
      setPersonas([])
    } finally {
      setLoadingPersonas(false)
    }
  }

  // Drift detection disabled - using template enforcement approach instead
  // useEffect(() => {
  //   if (!debate) return
  //   const templateSegments = debate.formatTemplate?.segmentStructure as SegmentStructure | undefined
  //   const analysis = calculateFormatDrift(segments, templateSegments, debate.formatTemplate?.name)
  //   setDriftAnalysis(analysis)
  // }, [debate, segments])

  // Convert template-based debate to custom format
  const handleConvertToCustom = async () => {
    if (!debateId) return

    try {
      const response = await fetch(`/api/debates/${debateId}/convert-to-custom`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to convert debate to custom format')
      }

      const updatedDebate = await response.json()
      setDebate(updatedDebate)
      setIsTemplateBasedDebate(false)
      setShowConvertDialog(false)
    } catch (err) {
      console.error('Error converting debate:', err)
      alert('Failed to convert debate to custom format')
    }
  }

  // Participant management functions
  const addParticipant = (personaId: string, role: ParticipantRole) => {
    const newParticipant = {
      personaId,
      role,
      speakingOrder: participants.length + 1,
    }
    setParticipants([...participants, newParticipant])
  }

  const removeParticipant = (index: number) => {
    const updated = participants.filter((_, i) => i !== index)
    // Reorder speaking order
    const reordered = updated.map((p, i) => ({ ...p, speakingOrder: i + 1 }))
    setParticipants(reordered)
  }

  const updateParticipantRole = (index: number, role: ParticipantRole) => {
    const updated = [...participants]
    updated[index] = { ...updated[index], role }
    setParticipants(updated)
  }

  const isPersonaSelected = (personaId: string) => {
    return participants.some((p) => p.personaId === personaId)
  }

  const handleCancelConfirm = () => {
    setShowCancelDialog(false)
    router.push('/admin/debates')
  }

  // Document upload handlers
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !debateId) return

    setUploadingDocument(true)
    setDocumentError(null)

    const formData = new FormData()
    formData.append('document', file)

    try {
      const response = await fetch(`/api/debates/${debateId}/upload-document`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document')
      }

      setDocumentUrl(data.documentUrl)
      setDocumentName(data.documentName)
      setDocumentSize(data.documentSize)
      setDocumentType(data.documentType)
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploadingDocument(false)
      // Reset the input
      e.target.value = ''
    }
  }

  const handleDocumentRemove = async () => {
    if (!debateId || !documentUrl) return

    setUploadingDocument(true)
    setDocumentError(null)

    try {
      const response = await fetch(`/api/debates/${debateId}/upload-document`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove document')
      }

      setDocumentUrl(null)
      setDocumentName(null)
      setDocumentSize(null)
      setDocumentType(null)
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : 'Removal failed')
    } finally {
      setUploadingDocument(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!debateId) return

    setSaving(true)
    setError(null)

    try {
      // Build request body - include participant constraints only for custom formats
      const requestBody: any = {
        title,
        topic,
        description: description || null,
        modeId,
        segmentStructure: segments,
        totalDurationMinutes,
        flexibleTiming,
        participants,
      }

      // Add participant constraints for custom format debates
      if (!isTemplateBasedDebate) {
        requestBody.minParticipants = minParticipants
        requestBody.maxParticipants = maxParticipants
        requestBody.requiresModerator = requiresModerator
      }

      const response = await fetch(`/api/debates/${debateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Failed to update debate'
        throw new Error(errorMessage)
      }

      // Success - redirect to debate detail page
      router.push(`/admin/debates/${debateId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading debate...</p>
        </div>
      </div>
    )
  }

  if (error && !debate) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!debate) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Debate not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">
          Edit Debate
        </h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Update your debate details and structure
        </p>
      </div>

      <form id="debate-edit-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl dark:bg-gray-800 dark:ring-white/10">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full">
                <label htmlFor="title" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                  Title
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="topic" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                  Topic
                </label>
                <div className="mt-2">
                  <textarea
                    id="topic"
                    rows={4}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <MarkdownEditor
                  value={description}
                  onChange={setDescription}
                  label="Description"
                  placeholder="Additional context or goals for this debate..."
                  rows={6}
                  optional
                />
              </div>
            </div>
          </div>
        </div>

        {/* Duration Settings */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl dark:bg-gray-800 dark:ring-white/10">
          <div className="px-4 py-6 sm:p-8">
            <h2 className="text-base font-semibold text-gray-900 mb-6 dark:text-white">Duration Settings</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="duration" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                  Target Duration (minutes)
                </label>
                <div className="mt-2">
                  <input
                    type="number"
                    id="duration"
                    min="1"
                    value={totalDurationMinutes}
                    onChange={(e) => setTotalDurationMinutes(parseInt(e.target.value) || 1)}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
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
                  onClick={() => setFlexibleTiming(!flexibleTiming)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:focus:ring-indigo-500 dark:focus:ring-offset-gray-900 ${
                    flexibleTiming
                      ? 'bg-indigo-600 dark:bg-indigo-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      flexibleTiming ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Segment Structure */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl dark:bg-gray-800 dark:ring-white/10">
          <div className="px-4 py-6 sm:p-8">
            {/* Template Enforcement Indicator */}
            {isTemplateBasedDebate && debate?.formatTemplate && (
              <div className="mb-6">
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 text-blue-600 mt-0.5 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                          Template-Based Format: "{debate.formatTemplate.name}"
                        </h4>
                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                          This debate uses a predefined format. You can only modify segment durations. To unlock full editing capabilities, convert this debate to a custom format.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConvertDialog(true)}
                      className="ml-4 shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Convert to Custom
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isTemplateBasedDebate && !debate?.formatTemplate && (
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-500/20">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.072 1.628.732 1.916.659.288 1.425.155 1.937-.232l2.5-1.875a.55.55 0 01.658 0l2.5 1.875c.512.387 1.278.52 1.937.232.66-.288.982-1.135.732-1.916l-.818-2.552a.5.5 0 01.177-.568l2.165-1.624a1.002 1.002 0 00-.572-1.743l-2.52-.252a.5.5 0 01-.423-.345l-.95-2.85a1.002 1.002 0 00-1.896 0l-.95 2.85a.5.5 0 01-.423.345l-2.52.252a1.002 1.002 0 00-.572 1.743l2.165 1.624a.5.5 0 01.177.568z" clipRule="evenodd" />
                  </svg>
                  Custom Format
                </span>
              </div>
            )}

            {/* Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-4">
                Mode <span className="text-red-600 dark:text-red-400">*</span>
              </label>

              {modesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 dark:border-gray-600 dark:border-t-indigo-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {modesData?.modes.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => !isTemplateBasedDebate && setModeId(mode.id)}
                      disabled={isTemplateBasedDebate}
                      className={`rounded-lg border-2 p-4 text-left transition-colors ${
                        modeId === mode.id
                          ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-500/10'
                          : 'border-gray-300 dark:border-white/10'
                      } ${
                        isTemplateBasedDebate
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

            <SegmentEditor
              segments={segments}
              onChange={setSegments}
              totalDurationMinutes={flexibleTiming ? undefined : totalDurationMinutes}
              readOnlyMode={isTemplateBasedDebate}
              templateName={debate?.formatTemplate?.name}
            />
          </div>
        </div>

        {/* Document Upload - Only for formats that allow document upload */}
        {isExpertReviewPanel && (
          <DocumentUploadSection
            documentUrl={documentUrl}
            documentName={documentName}
            documentSize={documentSize}
            documentType={documentType}
            uploadingDocument={uploadingDocument}
            documentError={documentError}
            onDocumentUpload={handleDocumentUpload}
            onDocumentRemove={handleDocumentRemove}
          />
        )}

        {/* Participants */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl dark:bg-gray-800 dark:ring-white/10">
          <div className="px-4 py-6 sm:p-8">
            <h2 className="text-base font-semibold text-gray-900 mb-2 dark:text-white">Participants</h2>
            <p className="text-sm text-gray-600 mb-6 dark:text-gray-400">
              Select {minParticipants} to {maxParticipants} personas to participate in this debate.
              {requiresModerator && ' A moderator is required.'}
            </p>

            {/* Participant Constraints - Only editable for custom formats */}
            {!isTemplateBasedDebate && (
              <div className="mb-6 rounded-lg bg-gray-50 p-4 border border-gray-200 dark:bg-gray-900/50 dark:border-white/10">
                <h3 className="text-sm font-medium text-gray-900 mb-4 dark:text-white">
                  Participant Requirements
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="minParticipants"
                      className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    >
                      Minimum Participants
                    </label>
                    <div className="mt-2">
                      <input
                        type="number"
                        id="minParticipants"
                        min={1}
                        max={maxParticipants}
                        value={minParticipants}
                        onChange={(e) => setMinParticipants(parseInt(e.target.value) || 1)}
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="maxParticipants"
                      className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                    >
                      Maximum Participants
                    </label>
                    <div className="mt-2">
                      <input
                        type="number"
                        id="maxParticipants"
                        min={minParticipants}
                        max={100}
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 1)}
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                      Moderator Requirement
                    </label>
                    <div className="mt-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="requiresModerator"
                          checked={requiresModerator}
                          onChange={(e) => setRequiresModerator(e.target.checked)}
                          className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-500"
                        />
                        <label htmlFor="requiresModerator" className="text-sm/6 text-gray-900 dark:text-white">
                          Requires Moderator
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Participants */}
            {participants.length > 0 && (
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Selected Participants ({participants.length}/{maxParticipants})
                </h3>
                <div className="space-y-2">
                  {participants.map((participant, index) => {
                    const persona = debate?.participants.find((p) => p.personaId === participant.personaId)?.persona ||
                                   personas.find((p) => p.id === participant.personaId)
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                            {persona?.avatarUrl ? (
                              <img
                                src={persona.avatarUrl}
                                alt={persona.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {persona?.name.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {persona?.name || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Order: {participant.speakingOrder}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="grid grid-cols-1">
                            <select
                              value={participant.role}
                              onChange={(e) => updateParticipantRole(index, e.target.value as ParticipantRole)}
                              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                            >
                              <option value="DEBATER">Debater</option>
                              <option value="MODERATOR">Moderator</option>
                              <option value="EXPERT">Expert</option>
                              <option value="HOST">Host</option>
                              <option value="JUDGE">Judge</option>
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
                          <button
                            type="button"
                            onClick={() => removeParticipant(index)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Warnings */}
            {requiresModerator && !participants.some((p) => p.role === 'MODERATOR') && (
              <div className="rounded-md bg-yellow-50 p-4 mb-6 dark:bg-yellow-500/10">
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  This format requires a moderator. Please assign one of the participants as moderator.
                </div>
              </div>
            )}

            {participants.length < minParticipants && (
              <div className="rounded-md bg-blue-50 p-4 mb-6 dark:bg-blue-500/10">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  You need at least {minParticipants - participants.length} more participant(s).
                </div>
              </div>
            )}

            {/* Add Participant */}
            {participants.length < maxParticipants && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Available Personas
                </h3>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search personas..."
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

                {/* Personas List */}
                {loadingPersonas ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-500"></div>
                  </div>
                ) : personas.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No personas found. Create some personas first.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                    {personas
                      .filter((persona) => !isPersonaSelected(persona.id))
                      .map((persona) => (
                        <button
                          key={persona.id}
                          type="button"
                          onClick={() => addParticipant(persona.id, 'DEBATER')}
                          className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                            {persona.avatarUrl ? (
                              <img
                                src={persona.avatarUrl}
                                alt={persona.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {persona.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {persona.name}
                            </div>
                            {persona.nickname && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {persona.nickname}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Form Actions */}
      <div className="max-w-4xl mx-auto mt-6 flex items-center justify-end gap-x-3">
        <button
          type="button"
          onClick={() => setShowCancelDialog(true)}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs border border-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:border-white/10 dark:hover:bg-white/20"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          form="debate-edit-form"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          {saving ? 'Saving...' : 'Update Debate'}
        </button>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelConfirm}
        title="Discard changes?"
        message="Are you sure you want to cancel? Any unsaved changes to this debate will be lost."
        confirmText="Discard"
        cancelText="Keep editing"
        variant="warning"
      />

      {/* Convert to Custom Format Confirmation Dialog */}
      <ConfirmDialog
        open={showConvertDialog}
        onClose={() => setShowConvertDialog(false)}
        onConfirm={handleConvertToCustom}
        title="Convert to Custom Format?"
        message={`This will remove the template link and unlock full editing capabilities for segments. You'll be able to add, remove, reorder, and modify all segment properties. This action cannot be undone. Continue?`}
        confirmText="Convert to Custom"
        cancelText="Keep Template"
        variant="warning"
      />
    </div>
  )
}
