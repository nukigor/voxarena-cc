'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ProgressBar } from './form/progress-bar'
import { WizardPage } from './form/wizard-page'
import { PersonaFormConfig } from '@/types/persona-form-config'
import { PersonaWithRelations } from '@/types/persona'

interface PersonaFormProps {
  config: PersonaFormConfig
  persona?: PersonaWithRelations
  onSuccess?: () => void
}

export function PersonaForm({ config, persona, onSuccess }: PersonaFormProps) {
  const router = useRouter()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allowSubmit, setAllowSubmit] = useState(false)

  // AI Generation toggles (only for editing)
  const [generateAvatar, setGenerateAvatar] = useState(false)
  const [generateTeaser, setGenerateTeaser] = useState(false)
  const [generateDescription, setGenerateDescription] = useState(false)

  // Confirmation dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const isEditing = !!persona

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    control,
  } = useForm({
    defaultValues: getDefaultValues(config, persona),
  })

  const values = watch()

  // Generate avatar initials from name
  const avatarPreview = useMemo(() => {
    if (persona?.avatarUrl) return persona.avatarUrl

    const name = values.name || ''
    if (!name) return ''

    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name[0]?.toUpperCase() || ''
  }, [values.name, persona?.avatarUrl])

  const currentPage = config.pages[currentPageIndex]
  const isFirstPage = currentPageIndex === 0
  const isLastPage = currentPageIndex === config.pages.length - 1

  const handleNext = async () => {
    // Validate current page fields
    const fieldsToValidate = currentPage.fieldGroups.flatMap((group) =>
      group.fields.map((f) => f.name)
    )

    const isValid = await trigger(fieldsToValidate)

    if (isValid && !isLastPage) {
      setCurrentPageIndex((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (!isFirstPage) {
      setCurrentPageIndex((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleCancelConfirm = () => {
    setShowCancelDialog(false)
    router.push('/admin/personas')
  }

  const handleSaveConfirm = async () => {
    setShowSaveDialog(false)
    setAllowSubmit(true)

    // Use setTimeout to ensure state updates before submission
    setTimeout(() => {
      const submitButton = document.getElementById('hidden-submit-button') as HTMLButtonElement
      if (submitButton) {
        console.log('Triggering hidden submit button click')
        submitButton.click()
      } else {
        console.error('Hidden submit button not found')
      }
    }, 0)
  }

  const onSubmit = async (data: any, event: any) => {
    console.log('onSubmit called', {
      isLastPage,
      currentPageIndex,
      totalPages: config.pages.length,
      currentPageTitle: currentPage.title,
      submitter: event?.nativeEvent?.submitter,
      submitterType: event?.nativeEvent?.submitter?.type,
      allowSubmit
    })

    // Only allow submission if explicitly enabled
    if (!allowSubmit) {
      console.warn('Form submission prevented: allowSubmit flag is false')
      return
    }

    // Prevent submission if not on the last page
    if (!isLastPage) {
      console.warn('Form submission prevented: not on last page')
      return
    }

    console.log('Proceeding with form submission...')
    setIsSubmitting(true)
    setAllowSubmit(false) // Reset the flag

    try {
      // Separate persona table fields from taxonomy term IDs
      const { personaData, taxonomyTermIds } = transformFormData(data, config)

      const url = isEditing ? `/api/personas/${persona.id}` : '/api/personas'

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...personaData,
          taxonomyTermIds,
          // AI generation flags
          // When creating new persona, always generate (true)
          // When editing, use toggle values
          generateAvatar: isEditing ? generateAvatar : true,
          generateTeaser: isEditing ? generateTeaser : true,
          generateDescription: isEditing ? generateDescription : true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save persona')
      }

      onSuccess?.()
      router.push('/admin/personas')
      router.refresh()
    } catch (error) {
      console.error('Error saving persona:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to save persona. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          console.log('Form onSubmit event triggered', {
            isLastPage,
            currentPageTitle: currentPage.title,
            submitter: (e.nativeEvent as any).submitter
          })
          handleSubmit(onSubmit)(e)
        }}
        onKeyDown={(e) => {
          // Prevent form submission on Enter key press
          if (e.key === 'Enter' && e.target instanceof HTMLInputElement && e.target.type !== 'submit') {
            console.log('Enter key prevented on input field')
            e.preventDefault()
          }
        }}
        className="max-w-4xl mx-auto"
      >
        {/* Hidden submit button for programmatic submission */}
        <button
          type="submit"
          id="hidden-submit-button"
          className="hidden"
          aria-hidden="true"
          onClick={() => {
            console.log('Hidden submit button clicked')
            setAllowSubmit(true)
          }}
        />
      <ProgressBar
        currentPage={currentPageIndex}
        totalPages={config.pages.length}
        pageNames={config.pages.map((p) => p.title)}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 dark:bg-gray-800 dark:border-white/10">
        <WizardPage
          page={currentPage}
          register={register}
          errors={errors}
          values={values}
          avatarPreview={avatarPreview}
          control={control}
        />

        {/* AI Generation Toggles (only show when editing existing persona) */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Regenerate with AI:</span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateAvatar}
                  onChange={(e) => setGenerateAvatar(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Avatar</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateTeaser}
                  onChange={(e) => setGenerateTeaser(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Teaser</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateDescription}
                  onChange={(e) => setGenerateDescription(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:bg-gray-700 dark:focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Description</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={isFirstPage}
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs border border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-white/20"
        >
          Previous
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowCancelDialog(true)}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs border border-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:border-white/10 dark:hover:bg-white/20"
          >
            Cancel
          </button>

          {!isLastPage ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                console.log('Save button clicked - showing confirmation dialog')
                setShowSaveDialog(true)
              }}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Update Persona'
                : 'Create Persona'}
            </button>
          )}
        </div>
      </div>
    </form>

    {/* Cancel Confirmation Dialog */}
    <ConfirmDialog
      open={showCancelDialog}
      onClose={() => setShowCancelDialog(false)}
      onConfirm={handleCancelConfirm}
      title="Discard changes?"
      message={
        isEditing
          ? "Are you sure you want to cancel? Any unsaved changes to this persona will be lost."
          : "Are you sure you want to cancel? All entered information will be discarded."
      }
      confirmText="Discard"
      cancelText="Keep editing"
      variant="warning"
    />

    {/* Save Confirmation Dialog */}
    <ConfirmDialog
      open={showSaveDialog}
      onClose={() => setShowSaveDialog(false)}
      onConfirm={handleSaveConfirm}
      title={isEditing ? "Update persona?" : "Create persona?"}
      message={
        isEditing
          ? "Are you sure you want to update this persona? This will save all changes and may regenerate AI content if selected."
          : "Are you sure you want to create this persona? Avatar, teaser, and description will be automatically generated using AI."
      }
      confirmText={isEditing ? "Update" : "Create"}
      cancelText="Review"
      variant="success"
      isLoading={isSubmitting}
    />
  </>
  )
}

// Helper functions
function getDefaultValues(
  config: PersonaFormConfig,
  persona?: PersonaWithRelations
) {
  const defaults: any = {}

  config.pages.forEach((page) => {
    page.fieldGroups.forEach((group) => {
      group.fields.forEach((field) => {
        if (persona) {
          // Editing mode - populate from existing persona
          if (field.source === 'persona_table') {
            defaults[field.name] = (persona as any)[field.name] ?? field.defaultValue ?? ''
          } else {
            // For taxonomy fields, get selected term IDs
            const selectedTerms = persona.taxonomyValues
              .filter((tv) => tv.term.category.slug === field.name)
              .map((tv) => tv.term.id)

            if (field.type === 'multi_select') {
              defaults[field.name] = selectedTerms
            } else {
              defaults[field.name] = selectedTerms[0] ?? ''
            }
          }
        } else {
          // Create mode - use default values
          defaults[field.name] =
            field.defaultValue ?? (field.type === 'multi_select' ? [] : '')
        }
      })
    })
  })

  return defaults
}

function transformFormData(data: any, config: PersonaFormConfig) {
  const personaData: any = {}
  const taxonomyTermIds: string[] = []

  config.pages.forEach((page) => {
    page.fieldGroups.forEach((group) => {
      group.fields.forEach((field) => {
        const value = data[field.name]

        if (field.source === 'persona_table' && field.type !== 'avatar') {
          // Don't include avatarUrl in the data sent to API
          // It will be handled separately by AI generation
          if (field.name !== 'avatarUrl') {
            personaData[field.name] = value || null
          }
        } else if (field.source === 'persona_taxonomy') {
          if (field.type === 'multi_select' && Array.isArray(value)) {
            taxonomyTermIds.push(...value.filter(Boolean))
          } else if (value) {
            taxonomyTermIds.push(value)
          }
        }
      })
    })
  })

  return { personaData, taxonomyTermIds }
}
