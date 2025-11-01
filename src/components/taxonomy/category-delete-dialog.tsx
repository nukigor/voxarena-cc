'use client'

import { AlertDialog } from '@/components/ui/alert-dialog'
import { TaxonomyCategoryWithCount } from '@/types/taxonomy'
import { useDeleteTaxonomyCategory } from '@/hooks/use-taxonomy-categories'

interface CategoryDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  category: TaxonomyCategoryWithCount | null
  onSuccess?: () => void
}

export function CategoryDeleteDialog({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryDeleteDialogProps) {
  const deleteMutation = useDeleteTaxonomyCategory()

  const handleConfirm = async () => {
    if (!category) return

    try {
      await deleteMutation.mutateAsync(category.id)
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  if (!category) return null

  const termCount = category._count?.terms || 0

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={`Delete "${category.name}"?`}
      message={
        termCount > 0
          ? `This will permanently delete the category "${category.name}" and all ${termCount} associated terms. This action cannot be undone.`
          : `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`
      }
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
    />
  )
}