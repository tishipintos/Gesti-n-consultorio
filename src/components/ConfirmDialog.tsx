import { useEffect, useRef } from 'react'
import { AlertTriangle, Trash2, X, DollarSign } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'payment'
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      const previousFocus = document.activeElement as HTMLElement | null
      confirmButtonRef.current?.focus()
      return () => previousFocus?.focus()
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === 'Escape') {
        onCancel()
        return
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel, onConfirm])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="relative w-full max-w-sm surface rounded-2xl p-6 shadow-2xl animate-scale-in"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              variant === 'payment' ? 'bg-[#DCFCE7]' : variant === 'danger' ? 'bg-error/10' : 'bg-warning/10'
            }`}
          >
            {variant === 'payment' ? <DollarSign size={24} className="text-[#15803D]" /> : variant === 'danger' ? (
              <Trash2 size={24} className="text-error" />
            ) : (
              <AlertTriangle size={24} className="text-warning" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="confirm-dialog-title"
              className="fluid-base font-semibold text-text-primary mb-1"
            >
              {title}
            </h3>
            <p
              id="confirm-dialog-message"
              className="fluid-sm text-text-secondary"
            >
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-text-secondary/40 hover:text-text-secondary transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-text-primary rounded-xl fluid-sm font-medium press-scale transition-all hover:bg-gray-200"
            style={{ height: 'var(--btn-h)' }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            className={`flex-1 rounded-xl fluid-sm font-semibold text-white press-scale transition-all ${
              variant === 'payment' ? 'bg-[#15803D] hover:bg-[#166534]' : variant === 'danger'
                ? 'bg-error hover:bg-error/90'
                : 'bg-warning hover:bg-warning/90'
            }`}
            style={{ height: 'var(--btn-h)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
