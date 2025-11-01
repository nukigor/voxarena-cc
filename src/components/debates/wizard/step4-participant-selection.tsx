'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import type { DebateBuilderStep4Data, ParticipantRole } from '@/types/debate'

interface Persona {
  id: string
  name: string
  nickname?: string
  avatarUrl?: string
}

interface Step4ParticipantSelectionProps {
  data: DebateBuilderStep4Data
  requiresModerator: boolean
  minParticipants: number
  maxParticipants: number
  onChange: (data: DebateBuilderStep4Data) => void
}

export function Step4ParticipantSelection({
  data,
  requiresModerator,
  minParticipants,
  maxParticipants,
  onChange,
}: Step4ParticipantSelectionProps) {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPersonas()
  }, [searchQuery])

  const fetchPersonas = async () => {
    try {
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
      setLoading(false)
    }
  }

  const addParticipant = (personaId: string, role: ParticipantRole) => {
    const newParticipant = {
      personaId,
      role,
      speakingOrder: data.participants.length + 1,
    }
    onChange({ participants: [...data.participants, newParticipant] })
  }

  const removeParticipant = (index: number) => {
    const updated = data.participants.filter((_, i) => i !== index)
    // Reorder speaking order
    const reordered = updated.map((p, i) => ({ ...p, speakingOrder: i + 1 }))
    onChange({ participants: reordered })
  }

  const updateParticipantRole = (index: number, role: ParticipantRole) => {
    const updated = [...data.participants]
    updated[index] = { ...updated[index], role }
    onChange({ participants: updated })
  }

  const isPersonaSelected = (personaId: string) => {
    return data.participants.some((p) => p.personaId === personaId)
  }

  const hasModerator = data.participants.some((p) => p.role === 'MODERATOR')
  const canAddMore = data.participants.length < maxParticipants
  const needsModerator = requiresModerator && !hasModerator

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Select Participants
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Choose {minParticipants} to {maxParticipants} personas to participate in this debate.
          {requiresModerator && ' A moderator is required.'}
        </p>
      </div>

      {/* Selected Participants */}
      {data.participants.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Selected Participants ({data.participants.length}/{maxParticipants})
          </h3>
          <div className="space-y-2">
            {data.participants.map((participant, index) => {
              const persona = personas.find((p) => p.id === participant.personaId)
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
      {needsModerator && (
        <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-500/10">
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            This format requires a moderator. Please assign one of the participants as moderator.
          </div>
        </div>
      )}

      {data.participants.length < minParticipants && (
        <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-500/10">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            You need at least {minParticipants - data.participants.length} more participant(s).
          </div>
        </div>
      )}

      {/* Add Participant */}
      {canAddMore && (
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
          {loading ? (
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
  )
}
