'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  SparklesIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/20/solid'
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function formatDate(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getStatusBadge(status: string) {
  const styles = {
    ACTIVE: 'bg-green-50 text-green-600 ring-green-600/20 dark:bg-green-500/10 dark:text-green-500 dark:ring-green-500/30',
    DRAFT: 'bg-gray-50 text-gray-600 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/30',
    ARCHIVED: 'bg-yellow-50 text-yellow-600 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-500 dark:ring-yellow-500/30',
  }
  return styles[status as keyof typeof styles] || styles.DRAFT
}

function getRoleBadge(role: string) {
  if (role === 'MODERATOR') {
    return 'bg-purple-50 text-purple-600 ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/30'
  }
  return 'bg-blue-50 text-blue-600 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30'
}

function truncateWords(text: string, wordLimit: number) {
  const words = text.split(/\s+/)
  if (words.length <= wordLimit) {
    return { truncated: text, isTruncated: false }
  }
  return {
    truncated: words.slice(0, wordLimit).join(' ') + '...',
    isTruncated: true,
  }
}

interface PersonaDetailViewProps {
  persona: any
  taxonomyByCategory: any
  debateTimeline: any[]
  totalDebates: number
  debaterCount: number
  moderatorCount: number
}

export function PersonaDetailView({
  persona,
  taxonomyByCategory,
  debateTimeline,
  totalDebates,
  debaterCount,
  moderatorCount
}: PersonaDetailViewProps) {
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regeneratedPersona, setRegeneratedPersona] = useState<any>(null)
  const [regenerateError, setRegenerateError] = useState<string | null>(null)
  const [avatarKey, setAvatarKey] = useState(0) // Cache-busting key for avatar
  const [isMounted, setIsMounted] = useState(false)

  // Initialize avatar key only on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    setAvatarKey(Date.now())
  }, [])

  // Get avatar initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name[0]?.toUpperCase() || ''
  }

  // Use regenerated persona if available, otherwise use original
  const currentPersona = regeneratedPersona || persona

  // Add cache-busting parameter to avatar URL (only on client after mount)
  const getAvatarUrl = (url: string | null) => {
    if (!url) return null
    // Only add cache-busting parameter after component has mounted on client
    if (!isMounted || avatarKey === 0) return url
    return `${url}?t=${avatarKey}`
  }

  // Truncate description
  const descriptionPreview = currentPersona.description
    ? truncateWords(currentPersona.description, 100)
    : null

  // Handler for opening regenerate dialog
  const handleRegenerateClick = () => {
    setShowRegenerateDialog(true)
    setRegenerateError(null)
  }

  // Handler for confirming regeneration
  const handleConfirmRegenerate = async () => {
    setIsRegenerating(true)
    setRegenerateError(null)

    try {
      const response = await fetch(`/api/personas/${persona.id}/regenerate`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to regenerate AI content')
      }

      const updatedPersona = await response.json()
      setRegeneratedPersona(updatedPersona)

      // Update avatar cache-busting key to force reload
      setAvatarKey(Date.now())

      // Close dialog after successful regeneration
      setTimeout(() => {
        setShowRegenerateDialog(false)
        setIsRegenerating(false)
      }, 500)
    } catch (error: any) {
      console.error('Regeneration error:', error)
      setRegenerateError(error.message || 'Failed to regenerate AI content')
      setIsRegenerating(false)
    }
  }

  // Handler for closing regenerate dialog
  const handleCloseRegenerateDialog = () => {
    if (!isRegenerating) {
      setShowRegenerateDialog(false)
      setRegenerateError(null)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="relative isolate">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-full left-16 -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80 dark:opacity-30">
            <div
              style={{
                clipPath:
                  'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
              }}
              className="aspect-1154/678 w-288.5 bg-linear-to-br from-[#FF80B5] to-[#9089FC]"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gray-900/5 dark:bg-white/5" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/admin/personas"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Personas
          </Link>

          <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
            <div className="flex items-center gap-x-6">
              {currentPersona.avatarUrl ? (
                <div className="relative group z-50">
                  <img
                    alt={currentPersona.name}
                    src={getAvatarUrl(currentPersona.avatarUrl) || ''}
                    className="size-16 flex-none rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10 cursor-pointer transition-transform duration-200 group-hover:scale-110"
                  />
                  {/* Enlarged avatar on hover */}
                  <div className="fixed left-0 top-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center" style={{ zIndex: 9999 }}>
                    <img
                      alt={currentPersona.name}
                      src={getAvatarUrl(currentPersona.avatarUrl) || ''}
                      className="w-64 h-64 rounded-full bg-gray-100 outline outline-4 -outline-offset-4 outline-white dark:bg-gray-800 dark:outline-gray-900 shadow-2xl object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="size-16 flex-none rounded-full bg-gray-200 outline -outline-offset-1 outline-black/5 dark:bg-gray-700 dark:outline-white/10 flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    {getInitials(currentPersona.name)}
                  </span>
                </div>
              )}
              <h1>
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">{currentPersona.name}</span>
                  <span
                    className={classNames(
                      'rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                      getStatusBadge(currentPersona.status)
                    )}
                  >
                    {currentPersona.status}
                  </span>
                </div>
                {currentPersona.nickname && (
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">&ldquo;{currentPersona.nickname}&rdquo;</div>
                )}
                {currentPersona.teaser && (
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 max-w-2xl">{currentPersona.teaser}</div>
                )}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 sm:gap-x-6">
              <Link
                href={`/admin/personas/${persona.id}/edit`}
                className="hidden sm:inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={handleRegenerateClick}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
              >
                <SparklesIcon className="h-4 w-4 inline mr-1.5" />
                Regenerate AI Content
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        {/* Total Debates - Full Width Card */}
        <div className="rounded-lg bg-gray-50 shadow-xs outline-1 outline-gray-900/5 mb-8 dark:bg-gray-800/50 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
          <dl className="flex flex-wrap items-center">
            <div className="flex-auto pt-6 pl-6">
              <dt className="text-sm/6 font-semibold text-gray-900 dark:text-white">Total Debates</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{totalDebates}</dd>
            </div>
            <div className="flex gap-6 px-6 pt-6 pb-6">
              <div className="flex items-center gap-x-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{debaterCount}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">As Debater</div>
                </div>
              </div>
              <div className="flex items-center gap-x-3">
                <UserCircleIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{moderatorCount}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">As Moderator</div>
                </div>
              </div>
              <div className="flex items-center gap-x-3">
                <CalendarDaysIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(currentPersona.createdAt)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Created</div>
                </div>
              </div>
            </div>
          </dl>
        </div>

        {/* Two Column Layout: Details + Debate History */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Persona Details (2/3 width) */}
          <div className="lg:col-span-2">
            <div>
              {/* Description */}
              {currentPersona.description && descriptionPreview && (
                <div className="mb-12">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {descriptionPreview.truncated}
                    </p>
                    {descriptionPreview.isTruncated && (
                      <button
                        onClick={() => setShowDescriptionDialog(true)}
                        className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Read more →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Characteristics */}
              {Object.keys(taxonomyByCategory).length > 0 && (
                <div className="mb-12">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Characteristics</h2>
                  <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {Object.values(taxonomyByCategory).map(({ category, terms }: any) => (
                      <div key={category.id} className="border-t border-gray-200 pt-4 dark:border-white/10">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{category.name}</dt>
                        <dd className="mt-2 flex flex-wrap gap-2">
                          {terms.map((term: any) => (
                            <span
                              key={term.id}
                              className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-500/20"
                              title={term.description}
                            >
                              {term.name}
                            </span>
                          ))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Professional Context */}
              {(currentPersona.professionRole || currentPersona.quirks) && (
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Professional Context</h2>
                  <dl className="space-y-6">
                    {currentPersona.professionRole && (
                      <div className="border-t border-gray-200 pt-4 dark:border-white/10">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Profession / Role</dt>
                        <dd className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {currentPersona.professionRole}
                        </dd>
                      </div>
                    )}
                    {currentPersona.quirks && (
                      <div className="border-t border-gray-200 pt-4 dark:border-white/10">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Distinctive Characteristics
                        </dt>
                        <dd className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {currentPersona.quirks}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Debate History (1/3 width) */}
          <div className="lg:col-span-1">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Debate History</h2>

              {debateTimeline.length === 0 ? (
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No debates yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This persona hasn&apos;t participated in any debates.
                  </p>
                </div>
              ) : (
                <ul role="list" className="space-y-6">
                  {debateTimeline.map((debate, debateIdx) => (
                    <li key={debate.id} className="relative flex gap-x-4">
                      <div
                        className={classNames(
                          debateIdx === debateTimeline.length - 1 ? 'h-6' : '-bottom-6',
                          'absolute top-0 left-0 flex w-6 justify-center'
                        )}
                      >
                        <div className="w-px bg-gray-200 dark:bg-white/10" />
                      </div>
                      <div className="relative flex size-6 flex-none items-center justify-center bg-white dark:bg-gray-950">
                        <CheckCircleIcon aria-hidden="true" className="size-6 text-indigo-600 dark:text-indigo-500" />
                      </div>
                      <div className="flex-auto rounded-md p-4 ring-1 ring-gray-200 ring-inset hover:ring-gray-300 transition-colors dark:ring-white/10 dark:hover:ring-white/20">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start gap-x-2">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex-1">
                              <Link href={`/admin/debates/${debate.id}`} className="hover:underline">
                                {debate.title}
                              </Link>
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={classNames(
                                'rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                                getRoleBadge(debate.role)
                              )}
                            >
                              {debate.role}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1">
                              <ChatBubbleLeftRightIcon className="h-4 w-4" />
                              {debate.format.replace('_', ' ')}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <UserCircleIcon className="h-4 w-4" />
                              {debate.participantCount} participant{debate.participantCount !== 1 ? 's' : ''}
                            </span>
                            <time dateTime={debate.dateTime} className="inline-flex items-center gap-1">
                              <CalendarDaysIcon className="h-4 w-4" />
                              {formatDate(debate.date)}
                            </time>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description Full Text Dialog (Slide-over) */}
      <Dialog open={showDescriptionDialog} onClose={setShowDescriptionDialog} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-gray-900/75"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-2xl transform transition data-closed:translate-x-full data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
              >
                <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl dark:bg-gray-900">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
                        Full Description
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setShowDescriptionDialog(false)}
                          className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 dark:bg-gray-900 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{currentPersona.description}</p>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Regenerate AI Content Dialog */}
      <Dialog open={showRegenerateDialog} onClose={handleCloseRegenerateDialog} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-gray-900/50"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95 dark:bg-gray-800 dark:outline dark:-outline-offset-1 dark:outline-white/10"
            >
              {!isRegenerating ? (
                <>
                  <div>
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/10">
                      <SparklesIcon aria-hidden="true" className="size-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <DialogTitle as="h3" className="text-base font-semibold text-gray-900 dark:text-white">
                        Regenerate AI Content?
                      </DialogTitle>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          This will regenerate the avatar, teaser, and description for this persona using AI. The current content will be replaced.
                        </p>
                      </div>
                      {regenerateError && (
                        <div className="mt-3 p-3 rounded-md bg-red-50 dark:bg-red-500/10">
                          <p className="text-sm text-red-600 dark:text-red-400">{regenerateError}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      onClick={handleCloseRegenerateDialog}
                      className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20 sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmRegenerate}
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500 sm:w-auto"
                    >
                      Regenerate
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/10">
                      <SparklesIcon aria-hidden="true" className="size-6 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <DialogTitle as="h3" className="text-base font-semibold text-gray-900 dark:text-white">
                        Regenerating...
                      </DialogTitle>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Please wait while we generate new AI content for your persona.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div className="bg-indigo-600 h-2 rounded-full dark:bg-indigo-500 animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
