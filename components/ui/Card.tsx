import * as React from 'react'

// Composable card primitives. Use Card > CardHeader / CardBody / CardFooter.

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-lg border border-border bg-background shadow-sm',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={['px-4 py-4 border-b border-border', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardBody({ className = '', children, ...props }: CardProps) {
  return (
    <div className={['px-4 py-4', className].join(' ')} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={['px-4 py-3 border-t border-border bg-muted/40', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
