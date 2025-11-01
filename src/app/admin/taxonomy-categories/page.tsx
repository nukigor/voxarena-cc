'use client'

import { useState } from 'react'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { CategoryFormModal } from '@/components/taxonomy/category-form-modal'
import { CategoryDeleteDialog } from '@/components/taxonomy/category-delete-dialog'
import { useTaxonomyCategories } from '@/hooks/use-taxonomy-categories'
import { TaxonomyCategoryWithCount } from '@/types/taxonomy'

export default function TaxonomyCategoriesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('sortOrder')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<TaxonomyCategoryWithCount | null>(null)

  // Track expanded descriptions
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set())

  // Fetch categories
  const { data, isLoading, isError, refetch } = useTaxonomyCategories({
    page,
    pageSize: 20,
    search,
    sortBy,
    sortOrder,
  })

  // Handle edit click
  const handleEdit = (category: TaxonomyCategoryWithCount) => {
    setSelectedCategory(category)
    setIsEditModalOpen(true)
  }

  // Handle delete click
  const handleDelete = (category: TaxonomyCategoryWithCount) => {
    setSelectedCategory(category)
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
  const toggleDescription = (categoryId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Truncate description to 200 characters
  const truncateDescription = (description: string | null, categoryId: string) => {
    if (!description) return '-'

    const isExpanded = expandedDescriptions.has(categoryId)
    const maxLength = 200

    if (description.length <= maxLength) {
      return description
    }

    if (isExpanded) {
      return (
        <>
          {description}{' '}
          <button
            onClick={() => toggleDescription(categoryId)}
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
          onClick={() => toggleDescription(categoryId)}
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
            Taxonomy Categories
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage taxonomy categories for personas
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            Add category
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative sm:max-w-xs">
          <input
            id="search"
            type="text"
            placeholder="Search categories..."
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

      {/* Table */}
      {isLoading ? (
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      ) : isError ? (
        <div className="mt-8 text-center">
          <p className="text-red-600 dark:text-red-400">Error loading categories. Please try again.</p>
        </div>
      ) : data && data.categories.length > 0 ? (
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
                            Category
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
                          Terms
                        </th>
                        <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-6">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-white/10 dark:bg-gray-800/50">
                      {data.categories.map((category) => (
                        <tr key={category.id}>
                          <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6 dark:text-white">
                            {category.name}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {truncateDescription(category.description, category.id)}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                            {category._count.terms}
                          </td>
                          <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEdit(category)}
                              >
                                Edit<span className="sr-only">, {category.name}</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDelete(category)}
                              >
                                Delete<span className="sr-only">, {category.name}</span>
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
          <p className="text-gray-500 dark:text-gray-400">No categories found.</p>
        </div>
      )}

      {/* Create Modal */}
      <CategoryFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch()
          setIsCreateModalOpen(false)
        }}
      />

      {/* Edit Modal */}
      <CategoryFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedCategory(null)
        }}
        category={selectedCategory}
        onSuccess={() => {
          refetch()
          setIsEditModalOpen(false)
          setSelectedCategory(null)
        }}
      />

      {/* Delete Dialog */}
      <CategoryDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedCategory(null)
        }}
        category={selectedCategory}
        onSuccess={() => {
          refetch()
          setIsDeleteDialogOpen(false)
          setSelectedCategory(null)
        }}
      />
    </div>
  )
}