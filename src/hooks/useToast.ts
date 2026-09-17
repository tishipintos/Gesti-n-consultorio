import { useState, useCallback, useRef, useEffect } from 'react'

interface ToastItem {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const removeToast = useCallback((id: number) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ type, message }: { type: 'success' | 'error' | 'info'; message: string }) => {
      const id = ++toastId
      setToasts((prev) => [...prev, { id, type, message }])

      const timer = setTimeout(() => {
        removeToast(id)
      }, 3000)
      timersRef.current.set(id, timer)
    },
    [removeToast]
  )

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((t) => clearTimeout(t))
    }
  }, [])

  return { toast, toasts, removeToast }
}
