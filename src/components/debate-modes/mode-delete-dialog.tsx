'use client'

import { Mode } from '@prisma/client'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { useDeleteDebateMode } from '@/hooks/use-debate-modes'

interface ModeDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  mode: Mode | null
  onSuccess?: () => void
}

export function ModeDeleteDialog({
  isOpen,
  onClose,
  mode,
  onSuccess,
}: ModeDeleteDialogProps) {
  const deleteMutation = useDeleteDebateMode()

  const handleConfirm = async () => {
    if (!mode) return

    try {
      await deleteMutation.mutateAsync(mode.id)
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error deleting debate mode:', error)
    }
  }

  if (!mode) return null

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={`Delete "${mode.name}"?`}
      message={`Are you sure you want to delete the debate mode "${mode.name}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
    />
  )
}
