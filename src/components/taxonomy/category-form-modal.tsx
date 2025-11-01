'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldType } from '@prisma/client'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import {
  TaxonomyCategoryFormData,
  TaxonomyCategoryWithTerms,
} from '@/types/taxonomy'
import {
  taxonomyCategorySchema,
  generateSlug,
} from '@/lib/validations/taxonomy'
import {
  useCreateTaxonomyCategory,
  useUpdateTaxonomyCategory,
} from '@/hooks/use-taxonomy-categories'

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  category?: TaxonomyCategoryWithTerms | null
  onSuccess?: () => void
}

const fieldTypeOptions = [
  { value: FieldType.SINGLE_SELECT, label: 'Single Select' },
  { value: FieldType.MULTI_SELECT, label: 'Multi Select' },
  { value: FieldType.SLIDER, label: 'Slider' },
]

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryFormModalProps) {
  const isEditing = !!category

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TaxonomyCategoryFormData>({
    resolver: zodResolver(taxonomyCategorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      fieldType: FieldType.SINGLE_SELECT,
      isMandatory: false,
      promptWeight: 5,
      sortOrder: 0,
    },
  })

  const createMutation = useCreateTaxonomyCategory()
  const updateMutation = useUpdateTaxonomyCategory(category?.id || '')

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
      if (category) {
        reset({
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          fieldType: category.fieldType,
          isMandatory: category.isMandatory,
          promptWeight: category.promptWeight,
          sortOrder: category.sortOrder,
        })
      } else {
        reset({
          name: '',
          slug: '',
          description: '',
          fieldType: FieldType.SINGLE_SELECT,
          isMandatory: false,
          promptWeight: 5,
          sortOrder: 0,
        })
      }
    }
  }, [isOpen, category, reset])

  const onSubmit = async (data: TaxonomyCategoryFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data)
      } else {
        await createMutation.mutateAsync(data)
      }
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Taxonomy Category' : 'Add Taxonomy Category'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
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

            {/* Field Type */}
            <div className="sm:col-span-3">
              <label htmlFor="fieldType" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                Field Type <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  {...register('fieldType')}
                  id="fieldType"
                  disabled={isLoading}
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                >
                  {fieldTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
                />
              </div>
              {errors.fieldType && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.fieldType.message}</p>
              )}
            </div>

            {/* Prompt Weight */}
            <div className="sm:col-span-3">
              <label htmlFor="promptWeight" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                Prompt Weight <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <div className="mt-2">
                <input
                  {...register('promptWeight', { valueAsNumber: true })}
                  id="promptWeight"
                  type="number"
                  min={1}
                  max={10}
                  disabled={isLoading}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                />
              </div>
              <p className="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">
                1-10, higher = more influential
              </p>
              {errors.promptWeight && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.promptWeight.message}</p>
              )}
            </div>

            {/* Sort Order */}
            <div className="sm:col-span-3">
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

            {/* Mandatory Checkbox */}
            <div className="sm:col-span-6">
              <div className="flex gap-3">
                <div className="flex h-6 shrink-0 items-center">
                  <div className="group grid size-4 grid-cols-1">
                    <input
                      {...register('isMandatory')}
                      id="isMandatory"
                      type="checkbox"
                      disabled={isLoading}
                      className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/5 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:indeterminate:border-indigo-500 dark:indeterminate:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/5 dark:disabled:bg-white/10 dark:disabled:checked:bg-white/10 forced-colors:appearance-auto"
                    />
                    <svg
                      fill="none"
                      viewBox="0 0 14 14"
                      className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25 dark:group-has-disabled:stroke-white/25"
                    >
                      <path
                        d="M3 8L6 11L11 3.5"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-0 group-has-checked:opacity-100"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-sm/6">
                  <label htmlFor="isMandatory" className="font-medium text-gray-900 dark:text-white">
                    Mandatory
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">
                    Require this field when creating personas
                  </p>
                </div>
              </div>
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
