interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rect' | 'card'
  className?: string
}

export function Skeleton({ variant = 'text', className = '' }: SkeletonProps) {
  const baseClass = 'animate-pulse bg-gray-200 rounded'

  const variantClass = {
    text: 'h-4 w-full rounded',
    circle: 'rounded-full',
    rect: 'rounded-xl',
    card: 'h-24 w-full rounded-2xl',
  }[variant]

  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      aria-hidden="true"
    />
  )
}