import * as React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-ring',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-ring',
  ghost:     'hover:bg-muted text-foreground focus-visible:ring-ring',
  outline:   'border border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8  px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled ?? isLoading}
      className={[
        'inline-flex items-center justify-center gap-2 whitespace-nowrap',
        'rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {isLoading && (
        <span
          className="h-4 w-4 motion-safe:animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
