'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pagination } from '@/components/ui/pagination'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { usePersonas } from '@/hooks/use-personas'
import { PersonaWithRelations } from '@/types/persona'

export default function PersonasPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now())

  // Delete flow state
  const [deletePersonaId, setDeletePersonaId] = useState<string | null>(null)
  const [deletePersonaName, setDeletePersonaName] = useState<string>('')
  const [deleteDebateCount, setDeleteDebateCount] = useState<number>(0)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBlockedDialog, setShowBlockedDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading, isError, refetch } = usePersonas({ page, pageSize: 20, search })

  // Update avatar timestamp when data changes (after refetch)
  useEffect(() => {
    if (data) {
      setAvatarTimestamp(Date.now())
    }
  }, [data])

  // Memoize avatar initials function
  const getAvatarInitials = useCallback((name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name[0]?.toUpperCase() || ''
  }, [])

  // Memoize debate counts function
  const getDebateCounts = useCallback((persona: PersonaWithRelations) => {
    const debaterCount = persona._count?.debateParticipations || 0
    const moderatorCount = 0 // TODO: Filter by MODERATOR role
    return { debaterCount, moderatorCount }
  }, [])

  // Add cache-busting parameter to avatar URL
  const getAvatarUrl = useCallback((url: string | null) => {
    if (!url) return null
    return `${url}?t=${avatarTimestamp}`
  }, [avatarTimestamp])

  // Handle delete button click - initiate delete flow
  const handleDeleteClick = async (persona: PersonaWithRelations) => {
    const debateCount = persona._count?.debateParticipations || 0

    setDeletePersonaId(persona.id)
    setDeletePersonaName(persona.name)
    setDeleteDebateCount(debateCount)

    if (debateCount > 0) {
      // Persona has debates - show blocked dialog with archive option
      setShowBlockedDialog(true)
    } else {
      // Persona has no debates - show delete confirmation
      setShowDeleteDialog(true)
    }
  }

  // Handle permanent delete (for personas without debates)
  const handleDeleteConfirm = async () => {
    if (!deletePersonaId) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/personas/${deletePersonaId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete persona')
      }

      // Success - refetch list and close dialog
      await refetch()
      setShowDeleteDialog(false)
      setDeletePersonaId(null)
      setDeletePersonaName('')
      setDeleteDebateCount(0)
    } catch (error) {
      console.error('Error deleting persona:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete persona')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle archive (for personas with debates)
  const handleArchiveConfirm = async () => {
    if (!deletePersonaId) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/personas/${deletePersonaId}/archive`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to archive persona')
      }

      // Success - refetch list and close dialog
      await refetch()
      setShowBlockedDialog(false)
      setDeletePersonaId(null)
      setDeletePersonaName('')
      setDeleteDebateCount(0)
    } catch (error) {
      console.error('Error archiving persona:', error)
      alert(error instanceof Error ? error.message : 'Failed to archive persona')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle keep active (close blocked dialog)
  const handleKeepActive = () => {
    setShowBlockedDialog(false)
    setDeletePersonaId(null)
    setDeletePersonaName('')
    setDeleteDebateCount(0)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Personas
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage your AI personas for debates
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => router.push('/admin/personas/new')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            Create persona
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative sm:max-w-xs">
          <input
            id="search"
            type="text"
            placeholder="Search personas..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1) // Reset to first page on search
            }}
            className="block w-full rounded-md bg-white px-3 py-1.5 pr-10 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
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

      {/* Personas Grid */}
      {isLoading ? (
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading personas...</p>
        </div>
      ) : isError ? (
        <div className="mt-8 text-center">
          <p className="text-red-600 dark:text-red-400">Error loading personas. Please try again.</p>
        </div>
      ) : data && data.personas.length > 0 ? (
        <>
          <ul role="list" className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.personas.map((persona) => {
              const { debaterCount, moderatorCount } = getDebateCounts(persona)
              const initials = getAvatarInitials(persona.name)

              return (
                <li
                  key={persona.id}
                  className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white shadow-sm border border-gray-200 dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:border-white/10"
                >
                  <Link href={`/admin/personas/${persona.id}`} className="flex flex-1 w-full items-center justify-between space-x-6 p-6 hover:bg-gray-50 dark:hover:bg-gray-800/75 transition-colors rounded-t-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">{persona.name}</h3>
                        <span className="inline-flex shrink-0 items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 inset-ring inset-ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:inset-ring-blue-500/10">
                          Debates {debaterCount}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 break-words">
                        {persona.teaser || 'No teaser available'}
                      </p>
                      {moderatorCount > 0 && (
                        <div className="mt-2">
                          <span className="inline-flex shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 inset-ring inset-ring-green-600/20 dark:bg-green-500/10 dark:text-green-500 dark:inset-ring-green-500/10">
                            Moderator {moderatorCount}
                          </span>
                        </div>
                      )}
                    </div>
                    {persona.avatarUrl ? (
                      <img
                        alt={persona.name}
                        src={getAvatarUrl(persona.avatarUrl) || ''}
                        className="size-10 shrink-0 rounded-full bg-gray-200 outline -outline-offset-1 outline-black/5 dark:bg-gray-700 dark:outline-white/10"
                      />
                    ) : (
                      <div className="size-10 shrink-0 rounded-full bg-gray-200 outline -outline-offset-1 outline-black/5 dark:bg-gray-700 dark:outline-white/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {initials}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className="-mt-px flex divide-x divide-gray-200 dark:divide-white/10">
                    <div className="flex w-0 flex-1">
                      <button
                        onClick={() => router.push(`/admin/personas/${persona.id}/edit`)}
                        className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/10 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="-ml-px flex w-0 flex-1">
                      <button
                        onClick={() => handleDeleteClick(persona)}
                        className="relative inline-flex w-0 flex-1 items-center justify-center rounded-br-lg border border-transparent py-4 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Pagination */}
          {data.pagination && data.pagination.total > 0 && (
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              totalItems={data.pagination.total}
              itemsPerPage={data.pagination.pageSize}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {search ? 'No personas found matching your search.' : 'No personas found. Create your first persona to get started!'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog (for personas without debates) */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete persona?"
        message={`Are you sure you want to permanently delete "${deletePersonaName}"? This action cannot be undone.`}
        confirmText="Delete Permanently"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Blocked Delete Dialog (for personas with debates) */}
      <ConfirmDialog
        open={showBlockedDialog}
        onClose={handleKeepActive}
        onConfirm={handleArchiveConfirm}
        title="Cannot delete persona"
        message={`"${deletePersonaName}" has participated in ${deleteDebateCount} debate${deleteDebateCount === 1 ? '' : 's'}. To preserve debate history, this persona cannot be permanently deleted. You can archive it instead to hide it from active use while preserving all debate records.`}
        confirmText="Archive Instead"
        cancelText="Keep Active"
        variant="warning"
        isLoading={isDeleting}
        secondaryAction={handleKeepActive}
        secondaryText="Keep Active"
      />
    </div>
  )
}
