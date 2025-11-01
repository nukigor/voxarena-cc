import { forwardRef, InputHTMLAttributes } from 'react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="relative flex items-start">
        <div className="flex h-6 items-center">
          <input
            ref={ref}
            type="checkbox"
            className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-indigo-500 ${className}`}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm leading-6">
            <label className="font-medium text-gray-900 dark:text-gray-200">{label}</label>
            {helperText && (
              <p className="text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
          </div>
        )}
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'