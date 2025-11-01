'use client'

import { AlertDialog } from '@/components/ui/alert-dialog'
import { TaxonomyTermWithCategory } from '@/types/taxonomy'
import { useDeleteTaxonomyTerm } from '@/hooks/use-taxonomy-terms'

interface TermDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  term: TaxonomyTermWithCategory | null
  onSuccess?: () => void
}

export function TermDeleteDialog({
  isOpen,
  onClose,
  term,
  onSuccess,
}: TermDeleteDialogProps) {
  const deleteMutation = useDeleteTaxonomyTerm()

  const handleConfirm = async () => {
    if (!term) return

    try {
      await deleteMutation.mutateAsync(term.id)
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error deleting term:', error)
    }
  }

  if (!term) return null

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={`Delete "${term.name}"?`}
      message={`Are you sure you want to delete the term "${term.name}" from the "${term.category.name}" category? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
    />
  )
}
