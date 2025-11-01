'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckIcon } from '@heroicons/react/24/solid'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Step1FormatSelection } from '@/components/debates/wizard/step1-format-selection'
import { Step2DebateDetails } from '@/components/debates/wizard/step2-debate-details'
import { Step3SegmentCustomization } from '@/components/debates/wizard/step3-segment-customization'
import { Step4ParticipantSelection } from '@/components/debates/wizard/step4-participant-selection'
import { Step5Review } from '@/components/debates/wizard/step5-review'
import { useDebateModes } from '@/hooks/use-debate-modes'
import type {
  DebateBuilderData,
  FormatTemplate,
  DebateBuilderStep2Data,
  DebateBuilderStep3Data,
  DebateBuilderStep4Data,
} from '@/types/debate'

const STEPS = [
  { id: '01', name: 'Format' },
  { id: '02', name: 'Details' },
  { id: '03', name: 'Segments' },
  { id: '04', name: 'Participants' },
  { id: '05', name: 'Review' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function NewDebatePage() {
  const router = useRouter()
  const { data: modesData } = useDebateModes({ pageSize: 100 })
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<FormatTemplate | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const [wizardData, setWizardData] = useState<DebateBuilderData>({
    step2: {
      title: '',
      topic: '',
      description: '',
    },
    step3: {
      segments: [],
      flexibleTiming: true,
      minParticipants: 2,
      maxParticipants: 10,
      requiresModerator: false,
      totalDurationMinutes: undefined,
      modeId: '', // Will be set when modes load
    },
    step4: {
      participants: [],
    },
  })

  // Set default mode when modes are loaded
  useEffect(() => {
    if (modesData?.modes.length && !wizardData.step3?.modeId) {
      // Default to first mode (or look for "debate-mode" slug)
      const defaultMode = modesData.modes.find(m => m.slug === 'debate-mode') || modesData.modes[0]
      setWizardData((prev) => ({
        ...prev,
        step3: {
          ...prev.step3!,
          modeId: defaultMode.id,
        },
      }))
    }
  }, [modesData, wizardData.step3?.modeId])

  // Load selected template
  useEffect(() => {
    if (selectedTemplateId) {
      loadTemplate(selectedTemplateId)
    } else {
      setSelectedTemplate(null)
    }
  }, [selectedTemplateId])

  const loadTemplate = async (templateId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/format-templates/${templateId}`)
      if (!response.ok) throw new Error('Failed to load template')

      const template = await response.json()
      setSelectedTemplate(template)

      // Map template's legacy mode enum to Mode database record
      // template.mode is "DEBATE" or "PODCAST" (enum)
      // We need to find the corresponding Mode record by slug
      const modeSlug = template.mode === 'DEBATE' ? 'debate-mode' : 'podcast-mode'
      const correspondingMode = modesData?.modes.find(m => m.slug === modeSlug)

      // Pre-populate wizard data from template
      setWizardData((prev) => ({
        ...prev,
        step3: {
          ...prev.step3!,
          modeId: correspondingMode?.id || prev.step3!.modeId,
          segments: template.segmentStructure,
          flexibleTiming: template.flexibleTiming,
        },
      }))
    } catch (error) {
      console.error('Error loading template:', error)
      alert('Failed to load template. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canProceedToStep2 = () => {
    return selectedTemplateId !== null || selectedTemplateId === null // Can proceed either way
  }

  const canProceedToStep3 = () => {
    const step2 = wizardData.step2!
    return step2.title.trim() !== '' && step2.topic.trim() !== ''
  }

  const canProceedToStep4 = () => {
    const step3 = wizardData.step3!
    return step3.segments.length > 0
  }

  const canProceedToStep5 = () => {
    const step3 = wizardData.step3!
    const step4 = wizardData.step4!

    // Get participant constraints from template or custom format config
    const minParticipants = selectedTemplate?.minParticipants || step3.minParticipants || 2
    const maxParticipants = selectedTemplate?.maxParticipants || step3.maxParticipants || 10
    const requiresModerator = selectedTemplate?.requiresModerator || step3.requiresModerator || false

    const validCount = step4.participants.length >= minParticipants && step4.participants.length <= maxParticipants
    const hasModerator = step4.participants.some((p) => p.role === 'MODERATOR')

    // Additional validation: max must be >= min
    const validRange = maxParticipants >= minParticipants

    return validCount && (!requiresModerator || hasModerator) && validRange
  }

  const canSubmit = () => {
    return canProceedToStep2() && canProceedToStep3() && canProceedToStep4() && canProceedToStep5()
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit()) return

    setSubmitting(true)
    try {
      const step2 = wizardData.step2!
      const step3 = wizardData.step3!
      const step4 = wizardData.step4!

      const totalDuration = step3.segments.reduce((sum, seg) => sum + seg.durationMinutes, 0)

      const payload = {
        title: step2.title,
        topic: step2.topic,
        modeId: step3.modeId,
        description: step2.description || null,
        formatTemplateId: selectedTemplateId,
        segmentStructure: step3.segments,
        totalDurationMinutes: totalDuration,
        flexibleTiming: step3.flexibleTiming,
        participants: step4.participants,
      }

      const response = await fetch('/api/debates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create debate')
      }

      const debate = await response.json()
      router.push(`/admin/debates/${debate.id}`)
    } catch (error: any) {
      console.error('Error creating debate:', error)
      alert(error.message || 'Failed to create debate. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const updateStep2 = (data: DebateBuilderStep2Data) => {
    setWizardData((prev) => ({ ...prev, step2: data }))
  }

  const updateStep3 = (data: DebateBuilderStep3Data) => {
    setWizardData((prev) => ({ ...prev, step3: data }))
  }

  const updateStep4 = (data: DebateBuilderStep4Data) => {
    setWizardData((prev) => ({ ...prev, step4: data }))
  }

  const handleCancelConfirm = () => {
    setShowCancelDialog(false)
    router.push('/admin/debates')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Debate
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Follow the steps to set up your debate format, details, segments, and participants
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 lg:border-t lg:border-b lg:border-gray-200 dark:lg:border-white/15">
          <nav aria-label="Progress" className="mx-auto max-w-7xl">
            <ol
              role="list"
              className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-r lg:border-l lg:border-gray-200 dark:lg:border-white/15"
            >
              {STEPS.map((step, stepIdx) => {
                const stepNumber = stepIdx + 1
                const status = currentStep > stepNumber ? 'complete' : currentStep === stepNumber ? 'current' : 'upcoming'

                return (
                  <li key={step.id} className="relative overflow-hidden lg:flex-1">
                    <div
                      className={classNames(
                        stepIdx === 0 ? 'rounded-t-md border-b-0' : '',
                        stepIdx === STEPS.length - 1 ? 'rounded-b-md border-t-0' : '',
                        'overflow-hidden border border-gray-200 lg:border-0 dark:border-white/15',
                      )}
                    >
                      {status === 'complete' ? (
                        <div className="group">
                          <span
                            aria-hidden="true"
                            className="absolute top-0 left-0 h-full w-1 bg-transparent lg:top-auto lg:bottom-0 lg:h-1 lg:w-full"
                          />
                          <span
                            className={classNames(
                              stepIdx !== 0 ? 'lg:pl-9' : '',
                              'flex items-start px-6 py-5 text-sm font-medium',
                            )}
                          >
                            <span className="shrink-0">
                              <span className="flex size-10 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500">
                                <CheckIcon aria-hidden="true" className="size-6 text-white" />
                              </span>
                            </span>
                            <span className="mt-0.5 ml-4 flex min-w-0 flex-col">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{step.name}</span>
                            </span>
                          </span>
                        </div>
                      ) : status === 'current' ? (
                        <div aria-current="step">
                          <span
                            aria-hidden="true"
                            className="absolute top-0 left-0 h-full w-1 bg-indigo-600 lg:top-auto lg:bottom-0 lg:h-1 lg:w-full dark:bg-indigo-500"
                          />
                          <span
                            className={classNames(
                              stepIdx !== 0 ? 'lg:pl-9' : '',
                              'flex items-start px-6 py-5 text-sm font-medium',
                            )}
                          >
                            <span className="shrink-0">
                              <span className="flex size-10 items-center justify-center rounded-full border-2 border-indigo-600 dark:border-indigo-500">
                                <span className="text-indigo-600 dark:text-indigo-400">{step.id}</span>
                              </span>
                            </span>
                            <span className="mt-0.5 ml-4 flex min-w-0 flex-col">
                              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{step.name}</span>
                            </span>
                          </span>
                        </div>
                      ) : (
                        <div className="group">
                          <span
                            aria-hidden="true"
                            className="absolute top-0 left-0 h-full w-1 bg-transparent lg:top-auto lg:bottom-0 lg:h-1 lg:w-full"
                          />
                          <span
                            className={classNames(
                              stepIdx !== 0 ? 'lg:pl-9' : '',
                              'flex items-start px-6 py-5 text-sm font-medium',
                            )}
                          >
                            <span className="shrink-0">
                              <span className="flex size-10 items-center justify-center rounded-full border-2 border-gray-300 dark:border-white/15">
                                <span className="text-gray-500 dark:text-gray-400">{step.id}</span>
                              </span>
                            </span>
                            <span className="mt-0.5 ml-4 flex min-w-0 flex-col">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{step.name}</span>
                            </span>
                          </span>
                        </div>
                      )}

                      {stepIdx !== 0 ? (
                        <>
                          {/* Separator */}
                          <div aria-hidden="true" className="absolute inset-0 top-0 left-0 hidden w-3 lg:block">
                            <svg
                              fill="none"
                              viewBox="0 0 12 82"
                              preserveAspectRatio="none"
                              className="size-full text-gray-300 dark:text-white/15"
                            >
                              <path d="M0.5 0V31L10.5 41L0.5 51V82" stroke="currentcolor" vectorEffect="non-scaling-stroke" />
                            </svg>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>

        {/* Step Content */}
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-800">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-500"></div>
              </div>
            ) : (
              <>
                {currentStep === 1 && (
                  <Step1FormatSelection
                    selectedTemplateId={selectedTemplateId}
                    onSelect={setSelectedTemplateId}
                  />
                )}
                {currentStep === 2 && wizardData.step2 && (
                  <Step2DebateDetails
                    data={wizardData.step2}
                    onChange={updateStep2}
                  />
                )}
                {currentStep === 3 && wizardData.step3 && (
                  <Step3SegmentCustomization
                    data={wizardData.step3}
                    onChange={updateStep3}
                    selectedTemplate={selectedTemplate}
                  />
                )}
                {currentStep === 4 && wizardData.step4 && wizardData.step3 && (
                  <Step4ParticipantSelection
                    data={wizardData.step4}
                    requiresModerator={selectedTemplate?.requiresModerator || wizardData.step3.requiresModerator || false}
                    minParticipants={selectedTemplate?.minParticipants || wizardData.step3.minParticipants || 2}
                    maxParticipants={selectedTemplate?.maxParticipants || wizardData.step3.maxParticipants || 10}
                    onChange={updateStep4}
                  />
                )}
                {currentStep === 5 && (
                  <Step5Review data={wizardData} selectedTemplate={selectedTemplate} />
                )}
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
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

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedToStep2()) ||
                    (currentStep === 2 && !canProceedToStep3()) ||
                    (currentStep === 3 && !canProceedToStep4()) ||
                    (currentStep === 4 && !canProceedToStep5())
                  }
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit() || submitting}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                  {submitting ? 'Creating...' : 'Create Debate'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Dialog */}
        <ConfirmDialog
          open={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={handleCancelConfirm}
          title="Discard changes?"
          message="Are you sure you want to cancel? All entered information will be discarded."
          confirmText="Discard"
          cancelText="Keep editing"
          variant="warning"
        />
      </div>
    </div>
  )
}
