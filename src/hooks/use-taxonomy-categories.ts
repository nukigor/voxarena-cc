import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  TaxonomyCategoriesResponse,
  TaxonomyCategoryFormData,
  TaxonomyCategoryWithCount,
  TaxonomyCategoryWithTerms,
} from '@/types/taxonomy'

interface UseTaxonomyCategoriesOptions {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Fetch paginated taxonomy categories
export function useTaxonomyCategories(options: UseTaxonomyCategoriesOptions = {}) {
  const {
    page = 1,
    pageSize = 20,
    search = '',
    sortBy = 'sortOrder',
    sortOrder = 'asc',
  } = options

  return useQuery<TaxonomyCategoriesResponse>({
    queryKey: ['taxonomy-categories', { page, pageSize, search, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/taxonomy-categories?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch taxonomy categories')
      }
      return response.json()
    },
  })
}

// Fetch single taxonomy category
export function useTaxonomyCategory(id: string | undefined) {
  return useQuery<TaxonomyCategoryWithTerms>({
    queryKey: ['taxonomy-category', id],
    queryFn: async () => {
      if (!id) throw new Error('Category ID is required')

      const response = await fetch(`/api/taxonomy-categories/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch taxonomy category')
      }
      return response.json()
    },
    enabled: !!id,
  })
}

// Create taxonomy category
export function useCreateTaxonomyCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TaxonomyCategoryFormData) => {
      const response = await fetch('/api/taxonomy-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create taxonomy category')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate the categories list to refetch data
      queryClient.invalidateQueries({ queryKey: ['taxonomy-categories'] })
    },
  })
}

// Update taxonomy category
export function useUpdateTaxonomyCategory(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TaxonomyCategoryFormData) => {
      const response = await fetch(`/api/taxonomy-categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update taxonomy category')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update the specific category in cache
      queryClient.setQueryData(['taxonomy-category', id], data)
      // Invalidate the categories list to refetch data
      queryClient.invalidateQueries({ queryKey: ['taxonomy-categories'] })
    },
  })
}

// Delete taxonomy category
export function useDeleteTaxonomyCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/taxonomy-categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete taxonomy category')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate the categories list to refetch data
      queryClient.invalidateQueries({ queryKey: ['taxonomy-categories'] })
    },
  })
}