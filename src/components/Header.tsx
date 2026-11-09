import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { hapticFeedback } from '../utils'

interface HeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  backTo?: string
  rightAction?: React.ReactNode
}

export function Header({ title, subtitle, showBack = false, backTo, rightAction }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="app-chrome flat-controls sticky top-0 z-30" style={{ boxShadow: '0 1px 0 rgba(82, 111, 152, 0.10)' }}>
      <div className="app-header-content flex items-center justify-between mx-auto" style={{ minHeight: 'var(--header-h)' }}>
        <div className="flex items-center min-w-[48px]">
          {(showBack || backTo) && (
            <button
              onClick={() => {
                hapticFeedback()
                if (backTo) navigate(backTo, { replace: true })
                else navigate(-1)
              }}
              className="p-2 -ml-2 press-scale"
              aria-label="Volver"
            >
              <ChevronLeft size={22} className="text-primary" strokeWidth={2.5} />
            </button>
          )}
        </div>
        <div className="text-center flex-1 min-w-0 px-2">
          <h1 className="app-header-title font-extrabold text-text-primary line-clamp-2 [overflow-wrap:anywhere] leading-tight py-0.5 tracking-[-0.02em]">{title}</h1>
          {subtitle && (
            <p className="app-header-subtitle text-text-secondary">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center justify-end min-w-[48px]">
          {rightAction}
        </div>
      </div>
    </header>
  )
}
