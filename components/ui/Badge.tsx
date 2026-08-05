import * as React from 'react'

type Variant = 'default' | 'secondary' | 'success' | 'warning' | 'destructive'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  default:     'bg-primary/10 text-primary',
  secondary:   'bg-secondary text-secondary-foreground',
  success:     'bg-accent/15 text-accent',
  warning:     'bg-yellow-100 text-yellow-800',
  destructive: 'bg-error/10 text-error',
}

export function Badge({
  variant = 'default',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5',
        'text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  )
}
