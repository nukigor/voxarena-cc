'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mode } from '@prisma/client'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { MarkdownEditor } from '@/components/ui/markdown-editor'
import {
  DebateModeFormData,
} from '@/types/debate-mode'
import {
  debateModeSchema,
  generateSlug,
} from '@/lib/validations/debate-mode'
import {
  useCreateDebateMode,
  useUpdateDebateMode,
} from '@/hooks/use-debate-modes'

interface ModeFormModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: Mode | null
  onSuccess?: () => void
}

export function ModeFormModal({
  isOpen,
  onClose,
  mode,
  onSuccess,
}: ModeFormModalProps) {
  const isEditing = !!mode

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<DebateModeFormData>({
    resolver: zodResolver(debateModeSchema),
    defaultValues: {
      name: '',
      slug: '',
      teaser: '',
      description: '',
    },
  })

  const createMutation = useCreateDebateMode()
  const updateMutation = useUpdateDebateMode(mode?.id || '')

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
      if (mode) {
        reset({
          name: mode.name,
          slug: mode.slug,
          teaser: mode.teaser || '',
          description: mode.description || '',
        })
      } else {
        reset({
          name: '',
          slug: '',
          teaser: '',
          description: '',
        })
      }
    }
  }, [isOpen, mode, reset])

  const onSubmit = async (data: DebateModeFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data)
      } else {
        await createMutation.mutateAsync(data)
      }
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error saving debate mode:', error)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Debate Mode' : 'Add Debate Mode'}
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

            {/* Teaser */}
            <div className="sm:col-span-6">
              <label htmlFor="teaser" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                Teaser
              </label>
              <div className="mt-2">
                <textarea
                  {...register('teaser')}
                  id="teaser"
                  rows={2}
                  disabled={isLoading}
                  placeholder="Short description of the mode"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                />
              </div>
              {errors.teaser && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.teaser.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-6">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <MarkdownEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    label="Description"
                    placeholder="Full description of the mode"
                    disabled={isLoading}
                    rows={8}
                    error={errors.description?.message}
                  />
                )}
              />
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
