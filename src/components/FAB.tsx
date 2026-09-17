import { Plus } from 'lucide-react'
import { hapticFeedback } from '../utils'

interface FABProps {
  onClick: () => void
  icon?: React.ReactNode
  label?: string
}

export function FAB({ onClick, icon, label }: FABProps) {
  return (
    <button
      onClick={() => {
        hapticFeedback()
        onClick()
      }}
      className="app-fab fixed right-5 z-40 bg-primary text-white rounded-full flex items-center justify-center gap-2.5 press-scale animate-fab-enter"
      style={{
        bottom: 'var(--fab-bottom)',
        paddingLeft: 'clamp(1.25rem, 1rem + 1vw, 1.75rem)',
        paddingRight: 'clamp(1.5rem, 1.2rem + 1vw, 2rem)',
        paddingTop: 'clamp(1rem, 0.8rem + 0.6vw, 1.25rem)',
        paddingBottom: 'clamp(1rem, 0.8rem + 0.6vw, 1.25rem)',
      }}
      aria-label={label || 'Agregar'}
    >
      {icon || <Plus size={24} strokeWidth={2.5} />}
      {label && <span className="fluid-sm font-semibold tracking-tight">{label}</span>}
    </button>
  )
}
