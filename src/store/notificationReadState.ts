import { create } from 'zustand'
import { storage } from '../platform/storage'
import type { Notification } from '../types'

const STORAGE_KEY = 'clinic_notification_seen'
const readSeen = (): string[] => {
  try {
    const value: unknown = JSON.parse(storage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(value) ? value.filter((key): key is string => typeof key === 'string') : []
  } catch { return [] }
}

// Rescheduling or changing a treatment makes that notification new again.
// Follow-up age text changes daily, so it intentionally isn't part of the key.
export const notificationKey = (notification: Notification): string => JSON.stringify([
  notification.id, notification.type, notification.date, notification.title,
  notification.type === 'followUp' ? '' : notification.subtitle,
])

export const useNotificationReadState = create<{
  seen: string[]
  markSeen: (keys: string[]) => void
}>((set, get) => ({
  seen: readSeen(),
  markSeen: (keys) => {
    const current = get().seen
    const seen = [...new Set([...current, ...keys])]
    if (seen.length === current.length) return
    try { storage.setItem(STORAGE_KEY, JSON.stringify(seen)) } catch { /* Keep session state if storage is unavailable. */ }
    set({ seen })
  },
}))
