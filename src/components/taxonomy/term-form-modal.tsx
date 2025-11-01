'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import {
  TaxonomyTermFormData,
  TaxonomyTermWithCategory,
} from '@/types/taxonomy'
import {
  taxonomyTermSchema,
  generateSlug,
} from '@/lib/validations/taxonomy'
import {
  useCreateTaxonomyTerm,
  useUpdateTaxonomyTerm,
} from '@/hooks/use-taxonomy-terms'
import { useTaxonomyCategories } from '@/hooks/use-taxonomy-categories'

interface TermFormModalProps {
  isOpen: boolean
  onClose: () => void
  term?: TaxonomyTermWithCategory | null
  onSuccess?: () => void
}

export function TermFormModal({
  isOpen,
  onClose,
  term,
  onSuccess,
}: TermFormModalProps) {
  const isEditing = !!term

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TaxonomyTermFormData>({
    resolver: zodResolver(taxonomyTermSchema),
    defaultValues: {
      categoryId: '',
      name: '',
      slug: '',
      description: '',
      sortOrder: 0,
    },
  })

  const createMutation = useCreateTaxonomyTerm()
  const updateMutation = useUpdateTaxonomyTerm(term?.id || '')

  // Fetch categories for dropdown
  const { data: categoriesData } = useTaxonomyCategories({ pageSize: 100 })

  const nameValue = watch('name')

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && nameValue) {
      setValue('slug', generateSlug(nameValue))
    }
  }, [nameValue, setValue, isEditing])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (term) {
        reset({
          categoryId: term.categoryId,
          name: term.name,
          slug: term.slug,
          description: term.description || '',
          sortOrder: term.sortOrder,
        })
      } else {
        reset({
          categoryId: '',
          name: '',
          slug: '',
          description: '',
          sortOrder: 0,
        })
      }
    }
  }, [isOpen, term, reset])

  const onSubmit = async (data: TaxonomyTermFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data)
      } else {
        await createMutation.mutateAsync(data)
      }
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error saving term:', error)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Taxonomy Term' : 'Add Taxonomy Term'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* Category */}
            <div className="sm:col-span-6">
              <label htmlFor="categoryId" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                Category <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  {...register('categoryId')}
                  id="categoryId"
                  disabled={isLoading}
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                >
                  <option value="">Select a category</option>
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
              {errors.categoryId && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Name */}
            <div className="sm:col-span-6">
              <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                Name <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <div className="mt-2">
                <input
                  {...register('name')}
                  id="name"
                  type="text"
                  disabled={isLoading}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="sm:col-span-6">
              <label htmlFor="slug" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                Slug <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <div className="mt-2">
                <input
                  {...register('slug')}
                  id="slug"
                  type="text"
                  disabled={isLoading}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                />
              </div>
              <p className="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">
                URL-friendly identifier (auto-generated from name)
              </p>
              {errors.slug && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.slug.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                Description
              </label>
              <div className="mt-2">
                <textarea
                  {...register('description')}
                  id="description"
                  rows={3}
                  disabled={isLoading}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                />
              </div>
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Sort Order */}
            <div className="sm:col-span-6">
              <label htmlFor="sortOrder" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                Sort Order <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <div className="mt-2">
                <input
                  {...register('sortOrder', { valueAsNumber: true })}
                  id="sortOrder"
                  type="number"
                  min={0}
                  disabled={isLoading}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                />
              </div>
              <p className="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">
                Lower numbers appear first
              </p>
              {errors.sortOrder && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.sortOrder.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-6 flex items-center justify-end gap-x-3">
          <Button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            size="md"
          >
            Cancel
          </Button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:shadow-none dark:focus-visible:outline-indigo-500"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
