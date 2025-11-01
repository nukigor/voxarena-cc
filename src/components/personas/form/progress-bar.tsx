'use client'

interface ProgressBarProps {
  currentPage: number
  totalPages: number
  pageNames: string[]
}

export function ProgressBar({
  currentPage,
  totalPages,
  pageNames,
}: ProgressBarProps) {
  const getStepStatus = (idx: number): 'complete' | 'current' | 'upcoming' => {
    if (idx < currentPage) return 'complete'
    if (idx === currentPage) return 'current'
    return 'upcoming'
  }

  return (
    <nav aria-label="Progress" className="mb-8 flex items-center justify-center">
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        Step {currentPage + 1} of {totalPages}
      </p>
      <ol role="list" className="ml-8 flex items-center space-x-5">
        {pageNames.map((name, stepIdx) => {
          const status = getStepStatus(stepIdx)
          return (
            <li key={name}>
              {status === 'complete' ? (
                <div className="block size-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500">
                  <span className="sr-only">{name}</span>
                </div>
              ) : status === 'current' ? (
                <div aria-current="step" className="relative flex items-center justify-center">
                  <span aria-hidden="true" className="absolute flex size-5 p-px">
                    <span className="size-full rounded-full bg-indigo-200 dark:bg-indigo-900" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="relative block size-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500"
                  />
                  <span className="sr-only">{name}</span>
                </div>
              ) : (
                <div className="block size-2.5 rounded-full bg-gray-200 dark:bg-white/15">
                  <span className="sr-only">{name}</span>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}