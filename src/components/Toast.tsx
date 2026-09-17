import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Info } from 'lucide-react'

interface ToastItem {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

interface ToastProps {
  toast: ToastItem
  onDismiss: (id: number) => void
}

const config = {
  success: {
    icon: CheckCircle,
    bg: 'bg-success/10 border-success/20',
    iconColor: 'text-success',
    text: 'text-success',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-error/10 border-error/20',
    iconColor: 'text-error',
    text: 'text-error',
  },
  info: {
    icon: Info,
    bg: 'bg-info/10 border-info/20',
    iconColor: 'text-info',
    text: 'text-info',
  },
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const { icon: Icon, bg, iconColor, text } = config[toast.type]

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-xl
        transition-all duration-300 ease-out
        ${bg}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <Icon size={18} className={iconColor} />
      <span className={`text-sm font-medium flex-1 ${text}`}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`text-xs ${text} opacity-60 hover:opacity-100 press-scale`}
        aria-label="Cerrar"
      >
        ×
      </button>
      <span className="sr-only">{toast.message}</span>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
