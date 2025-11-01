import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Mode } from '@prisma/client'
import {
  DebateModesResponse,
  DebateModeFormData,
} from '@/types/debate-mode'

interface UseDebateModesOptions {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Fetch paginated debate modes
export function useDebateModes(options: UseDebateModesOptions = {}) {
  const {
    page = 1,
    pageSize = 20,
    search = '',
    sortBy = 'name',
    sortOrder = 'asc',
  } = options

  return useQuery<DebateModesResponse>({
    queryKey: ['debate-modes', { page, pageSize, search, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/debate-modes?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch debate modes')
      }
      return response.json()
    },
  })
}

// Fetch single debate mode
export function useDebateMode(id: string | undefined) {
  return useQuery<Mode>({
    queryKey: ['debate-mode', id],
    queryFn: async () => {
      if (!id) throw new Error('Mode ID is required')

      const response = await fetch(`/api/debate-modes/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch debate mode')
      }
      return response.json()
    },
    enabled: !!id,
  })
}

// Create debate mode
export function useCreateDebateMode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: DebateModeFormData) => {
      const response = await fetch('/api/debate-modes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create debate mode')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate the modes list to refetch data
      queryClient.invalidateQueries({ queryKey: ['debate-modes'] })
    },
  })
}

// Update debate mode
export function useUpdateDebateMode(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: DebateModeFormData) => {
      const response = await fetch(`/api/debate-modes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update debate mode')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update the specific mode in cache
      queryClient.setQueryData(['debate-mode', id], data)
      // Invalidate the modes list to refetch data
      queryClient.invalidateQueries({ queryKey: ['debate-modes'] })
    },
  })
}

// Delete debate mode
export function useDeleteDebateMode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/debate-modes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete debate mode')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate the modes list to refetch data
      queryClient.invalidateQueries({ queryKey: ['debate-modes'] })
    },
  })
}
