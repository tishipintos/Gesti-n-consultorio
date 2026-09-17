import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { hapticFeedback } from '../utils'

interface HeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  rightAction?: React.ReactNode
}

export function Header({ title, subtitle, showBack = false, rightAction }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="app-chrome flat-controls sticky top-0 z-30" style={{ boxShadow: '0 1px 0 rgba(82, 111, 152, 0.10)' }}>
      <div className="app-header-content flex items-center justify-between max-w-lg mx-auto" style={{ height: 'var(--header-h)' }}>
        <div className="flex items-center min-w-[48px]">
          {showBack && (
            <button
              onClick={() => {
                hapticFeedback()
                navigate(-1)
              }}
              className="p-2 -ml-2 press-scale"
              aria-label="Volver"
            >
              <ChevronLeft size={22} className="text-primary" strokeWidth={2.5} />
            </button>
          )}
        </div>
        <div className="text-center flex-1 px-2">
          <h1 className="fluid-base font-bold text-text-primary truncate leading-normal py-0.5 tracking-[-0.02em]">{title}</h1>
          {subtitle && (
            <p className="fluid-xs text-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center justify-end min-w-[48px]">
          {rightAction}
        </div>
      </div>
    </header>
  )
}
