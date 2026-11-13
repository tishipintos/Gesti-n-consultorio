import { AppointmentIcon } from './AppointmentIcon'
import { Plus } from 'lucide-react'
import { hapticFeedback } from '../utils'

interface FABProps {
  onClick: () => void
  icon?: React.ReactNode
  label?: string
  appointment?: boolean
}

export function FAB({ onClick, icon, label, appointment }: FABProps) {
  return (
    <button
      onClick={() => {
        hapticFeedback()
        onClick()
      }}
      className="app-fab fixed right-5 z-40 bg-primary text-white flex items-center justify-center gap-2.5 press-scale"
      style={{
        bottom: 'var(--fab-bottom)',
      }}
      aria-label={label || 'Agregar'}
    >
      {icon || (appointment ? <AppointmentIcon /> : <Plus aria-hidden="true" size={24} strokeWidth={2} />)}
      {label && <span className="fluid-sm font-semibold tracking-tight">{label}</span>}
    </button>
  )
}
