import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'default' | 'danger'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'rounded-sm px-2 py-1 text-xs',
  sm: 'rounded-sm px-2 py-1 text-sm',
  md: 'rounded-md px-2.5 py-1.5 text-sm',
  lg: 'rounded-md px-3 py-2 text-sm',
  xl: 'rounded-md px-3.5 py-2.5 text-sm',
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-white text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20',
  danger: 'bg-white text-red-600 shadow-xs inset-ring inset-ring-red-300 hover:bg-red-50 dark:bg-red-900/10 dark:text-red-400 dark:shadow-none dark:inset-ring-red-800/30 dark:hover:bg-red-900/20',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    const classes = [
      'font-semibold',
      sizeClasses[size],
      variantClasses[variant],
      'disabled:opacity-50 disabled:cursor-not-allowed',
      className,
    ].filter(Boolean).join(' ')

    return (
      <button ref={ref} type="button" className={classes} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
