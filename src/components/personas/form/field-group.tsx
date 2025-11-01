'use client'

import { FieldGroup as FieldGroupType } from '@/types/persona-form-config'
import { DynamicField } from './dynamic-field'
import { UseFormRegister, FieldErrors, Control } from 'react-hook-form'

interface FieldGroupProps {
  group: FieldGroupType
  register: UseFormRegister<any>
  errors: FieldErrors
  values: any
  avatarPreview?: string
  control?: Control<any>
}

export function FieldGroup({
  group,
  register,
  errors,
  values,
  avatarPreview,
  control,
}: FieldGroupProps) {
  return (
    <div className="border-b border-gray-200 pb-8 last:border-0 dark:border-white/10">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        {group.title}
      </h3>
      {group.description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {group.description}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        {group.fields.map((field) => (
          <DynamicField
            key={field.name}
            field={field}
            register={register}
            errors={errors}
            value={values[field.name]}
            avatarPreview={field.type === 'avatar' ? avatarPreview : undefined}
            control={control}
          />
        ))}
      </div>
    </div>
  )
}
