'use client'

import { PageConfig } from '@/types/persona-form-config'
import { FieldGroup } from './field-group'
import { UseFormRegister, FieldErrors, Control } from 'react-hook-form'

interface WizardPageProps {
  page: PageConfig
  register: UseFormRegister<any>
  errors: FieldErrors
  values: any
  avatarPreview?: string
  control?: Control<any>
}

export function WizardPage({
  page,
  register,
  errors,
  values,
  avatarPreview,
  control,
}: WizardPageProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {page.title}
        </h2>
        {page.description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {page.description}
          </p>
        )}
      </div>

      {page.fieldGroups.map((group) => (
        <FieldGroup
          key={group.id}
          group={group}
          register={register}
          errors={errors}
          values={values}
          avatarPreview={avatarPreview}
          control={control}
        />
      ))}
    </div>
  )
}
