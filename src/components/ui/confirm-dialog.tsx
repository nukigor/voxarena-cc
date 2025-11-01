'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon, CheckIcon } from '@heroicons/react/24/outline'

export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'warning' | 'success' | 'danger'
  isLoading?: boolean
  secondaryAction?: () => void
  secondaryText?: string
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false,
  secondaryAction,
  secondaryText,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    // Note: Don't automatically close - let the parent component handle that
    // This allows the parent to show loading state during async operations
  }

  const variantStyles = {
    warning: {
      iconBg: 'bg-yellow-100 dark:bg-yellow-500/10',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      Icon: ExclamationTriangleIcon,
      confirmButton:
        'bg-yellow-600 hover:bg-yellow-500 focus-visible:outline-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-400 dark:focus-visible:outline-yellow-500',
    },
    success: {
      iconBg: 'bg-green-100 dark:bg-green-500/10',
      iconColor: 'text-green-600 dark:text-green-400',
      Icon: CheckIcon,
      confirmButton:
        'bg-green-600 hover:bg-green-500 focus-visible:outline-green-600 dark:bg-green-500 dark:hover:bg-green-400 dark:focus-visible:outline-green-500',
    },
    danger: {
      iconBg: 'bg-red-100 dark:bg-red-500/10',
      iconColor: 'text-red-600 dark:text-red-400',
      Icon: ExclamationTriangleIcon,
      confirmButton:
        'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600 dark:bg-red-500 dark:hover:bg-red-400 dark:focus-visible:outline-red-500',
    },
  }

  const style = variantStyles[variant]
  const Icon = style.Icon

  return (
    <Dialog open={open} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-gray-900/50"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95 dark:bg-gray-800 dark:outline dark:-outline-offset-1 dark:outline-white/10"
          >
            <div>
              <div className={`mx-auto flex size-12 items-center justify-center rounded-full ${style.iconBg}`}>
                <Icon aria-hidden="true" className={`size-6 ${style.iconColor}`} />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900 dark:text-white">
                  {title}
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                </div>
              </div>
            </div>
            {secondaryAction && secondaryText ? (
              // Three-button layout: Confirm, Secondary, Cancel
              <div className="mt-5 sm:mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:shadow-none ${style.confirmButton}`}
                >
                  {isLoading ? 'Processing...' : confirmText}
                </button>
                <button
                  type="button"
                  onClick={secondaryAction}
                  disabled={isLoading}
                  className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/10 dark:text-white dark:shadow-none dark:border-white/10 dark:hover:bg-white/20"
                >
                  {secondaryText}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  data-autofocus
                  className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/10 dark:text-white dark:shadow-none dark:border-white/10 dark:hover:bg-white/20"
                >
                  {cancelText}
                </button>
              </div>
            ) : (
              // Two-button layout: Confirm, Cancel
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 sm:col-start-2 disabled:opacity-50 disabled:cursor-not-allowed dark:shadow-none ${style.confirmButton}`}
                >
                  {isLoading ? 'Processing...' : confirmText}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  data-autofocus
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs border border-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/10 dark:text-white dark:shadow-none dark:border-white/10 dark:hover:bg-white/20"
                >
                  {cancelText}
                </button>
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
