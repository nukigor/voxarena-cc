'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { TermFormModal } from '@/components/taxonomy/term-form-modal'
import { TermDeleteDialog } from '@/components/taxonomy/term-delete-dialog'
import { useTaxonomyTerms } from '@/hooks/use-taxonomy-terms'
import { useTaxonomyCategories } from '@/hooks/use-taxonomy-categories'
import { TaxonomyTermWithCategory } from '@/types/taxonomy'

export default function TaxonomyTermsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState<string>('sortOrder')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState<TaxonomyTermWithCategory | null>(null)

  // Track expanded descriptions
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set())

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useTaxonomyCategories({ pageSize: 100 })

  // Fetch terms
  const { data, isLoading, isError, refetch } = useTaxonomyTerms({
    page,
    pageSize: 20,
    search,
    categoryId: categoryFilter,
    sortBy,
    sortOrder,
  })

  // Handle edit click
  const handleEdit = (term: TaxonomyTermWithCategory) => {
    setSelectedTerm(term)
    setIsEditModalOpen(true)
  }

  // Handle delete click
  const handleDelete = (term: TaxonomyTermWithCategory) => {
    setSelectedTerm(term)
    setIsDeleteDialogOpen(true)
  }

  // Handle sort
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // Toggle description expansion
  const toggleDescription = (termId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(termId)) {
        newSet.delete(termId)
      } else {
        newSet.add(termId)
      }
      return newSet
    })
  }

  // Truncate description to 200 characters
  const truncateDescription = (description: string | null, termId: string) => {
    if (!description) return '-'

    const isExpanded = expandedDescriptions.has(termId)
    const maxLength = 200

    if (description.length <= maxLength) {
      return description
    }

    if (isExpanded) {
      return (
        <>
          {description}{' '}
          <button
            onClick={() => toggleDescription(termId)}
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            Less
          </button>
        </>
      )
    }

    return (
      <>
        {description.substring(0, maxLength)}...{' '}
        <button
          onClick={() => toggleDescription(termId)}
          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
        >
          More
        </button>
      </>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Taxonomy Terms
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage taxonomy terms for personas
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            Add term
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs flex-1">
          <input
            id="search"
            type="text"
            placeholder="Search terms..."
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

        {/* Category Filter */}
        <div className="relative sm:max-w-xs flex-1 grid grid-cols-1">
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1) // Reset to first page on filter change
            }}
            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categoriesData?.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      ) : isError ? (
        <div className="mt-8 text-center">
          <p className="text-red-600 dark:text-red-400">Error loading terms. Please try again.</p>
        </div>
      ) : data && data.terms.length > 0 ? (
        <>
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow-sm border border-gray-200 sm:rounded-lg dark:shadow-none dark:border-white/10">
                  <table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
                    <thead className="bg-gray-50 dark:bg-gray-800/75">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-200"
                        >
                          <button
                            onClick={() => handleSort('name')}
                            className="group inline-flex items-center"
                          >
                            Term
                            {sortBy === 'name' && (
                              <span className="ml-2 text-gray-400">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                        >
                          Category
                        </th>
                        <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-6">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-white/10 dark:bg-gray-800/50">
                      {data.terms.map((term) => (
                        <tr key={term.id}>
                          <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6 dark:text-white">
                            {term.name}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {truncateDescription(term.description, term.id)}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                            {term.category.name}
                          </td>
                          <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEdit(term)}
                              >
                                Edit<span className="sr-only">, {term.name}</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDelete(term)}
                              >
                                Delete<span className="sr-only">, {term.name}</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
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
          <p className="text-gray-500 dark:text-gray-400">No terms found.</p>
        </div>
      )}

      {/* Create Modal */}
      <TermFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch()
          setIsCreateModalOpen(false)
        }}
      />

      {/* Edit Modal */}
      <TermFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedTerm(null)
        }}
        term={selectedTerm}
        onSuccess={() => {
          refetch()
          setIsEditModalOpen(false)
          setSelectedTerm(null)
        }}
      />

      {/* Delete Dialog */}
      <TermDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedTerm(null)
        }}
        term={selectedTerm}
        onSuccess={() => {
          refetch()
          setIsDeleteDialogOpen(false)
          setSelectedTerm(null)
        }}
      />
    </div>
  )
}
