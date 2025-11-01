import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  TaxonomyTermsResponse,
  TaxonomyTermFormData,
  TaxonomyTermWithCategory,
} from '@/types/taxonomy'

interface UseTaxonomyTermsOptions {
  page?: number
  pageSize?: number
  search?: string
  categoryId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Fetch paginated taxonomy terms
export function useTaxonomyTerms(options: UseTaxonomyTermsOptions = {}) {
  const {
    page = 1,
    pageSize = 20,
    search = '',
    categoryId = '',
    sortBy = 'sortOrder',
    sortOrder = 'asc',
  } = options

  return useQuery<TaxonomyTermsResponse>({
    queryKey: ['taxonomy-terms', { page, pageSize, search, categoryId, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        sortBy,
        sortOrder,
      })

      if (categoryId) {
        params.append('categoryId', categoryId)
      }

      const response = await fetch(`/api/taxonomy-terms?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch taxonomy terms')
      }
      return response.json()
    },
  })
}

// Fetch single taxonomy term
export function useTaxonomyTerm(id: string | undefined) {
  return useQuery<TaxonomyTermWithCategory>({
    queryKey: ['taxonomy-term', id],
    queryFn: async () => {
      if (!id) throw new Error('Term ID is required')

      const response = await fetch(`/api/taxonomy-terms/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch taxonomy term')
      }
      return response.json()
    },
    enabled: !!id,
  })
}

// Create taxonomy term
export function useCreateTaxonomyTerm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TaxonomyTermFormData) => {
      const response = await fetch('/api/taxonomy-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create taxonomy term')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate the terms list to refetch data
      queryClient.invalidateQueries({ queryKey: ['taxonomy-terms'] })
      // Also invalidate categories to update term counts
      queryClient.invalidateQueries({ queryKey: ['taxonomy-categories'] })
    },
  })
}

// Update taxonomy term
export function useUpdateTaxonomyTerm(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TaxonomyTermFormData) => {
      const response = await fetch(`/api/taxonomy-terms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update taxonomy term')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update the specific term in cache
      queryClient.setQueryData(['taxonomy-term', id], data)
      // Invalidate the terms list to refetch data
      queryClient.invalidateQueries({ queryKey: ['taxonomy-terms'] })
      // Also invalidate categories to update term counts if category changed
      queryClient.invalidateQueries({ queryKey: ['taxonomy-categories'] })
    },
  })
}

// Delete taxonomy term
export function useDeleteTaxonomyTerm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/taxonomy-terms/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete taxonomy term')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate the terms list to refetch data
      queryClient.invalidateQueries({ queryKey: ['taxonomy-terms'] })
      // Also invalidate categories to update term counts
      queryClient.invalidateQueries({ queryKey: ['taxonomy-categories'] })
    },
  })
}
