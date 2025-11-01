import { useQuery } from '@tanstack/react-query'
import { PersonaWithRelations } from '@/types/persona'

interface UsePersonasParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}

interface PersonasResponse {
  personas: PersonaWithRelations[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export function usePersonas(params: UsePersonasParams = {}) {
  const { page = 1, pageSize = 20, search = '', status = '' } = params

  return useQuery({
    queryKey: ['personas', page, pageSize, search, status],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        ...(status && { status }),
      })

      const response = await fetch(`/api/personas?${queryParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch personas')
      }

      return response.json() as Promise<PersonasResponse>
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    refetchInterval: false, // Disable automatic refetching at intervals
  })
}
