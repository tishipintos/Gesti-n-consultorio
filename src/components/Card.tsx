import { hapticFeedback } from '../utils'

interface CardProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  padding?: boolean
  role?: string
  style?: React.CSSProperties
}

export function Card({ children, onClick, className = '', padding = true, role, style }: CardProps) {
  return (
    <div
      role={role || (onClick ? 'button' : undefined)}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => {
        if (onClick) {
          hapticFeedback()
          onClick()
        }
      }}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          hapticFeedback()
          onClick()
        }
      }}
      style={style}
      className={`surface rounded-2xl ${
        padding ? 'card-fluid' : ''
      } ${onClick ? 'card-interactive press-scale cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
