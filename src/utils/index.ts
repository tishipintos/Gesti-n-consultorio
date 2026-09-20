import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isSameDay, isSameMonth, differenceInDays, isAfter, isBefore, addWeeks } from 'date-fns'
import { es } from 'date-fns/locale'

export { generateId } from '../platform/id'

export const formatDate = (date: string | Date, fmt: string = 'dd/MM/yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: es })
}

export const formatTime = (time: string): string => {
  return time
}

export const formatRelativeDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const diff = differenceInDays(d, now)

  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  if (diff === -1) return 'Ayer'
  if (diff > 1 && diff <= 7) return `En ${diff} días`
  if (diff < -1 && diff >= -7) return `Hace ${Math.abs(diff)} días`
  return formatDate(d, 'dd MMM yyyy')
}

export const getWeekDays = (startDate: Date): Date[] => {
  const start = startOfWeek(startDate, { weekStartsOn: 1 })
  return Array.from({ length: 14 }, (_, i) => addDays(start, i))
}

export const getMonthDays = (date: Date): Date[] => {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days: Date[] = []
  let current = calStart
  while (current <= calEnd) {
    days.push(current)
    current = addDays(current, 1)
  }
  return days
}

export const addMonthsToDate = (date: Date, months: number): Date => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export const isSameMonthFn = (a: Date, b: Date): boolean => isSameMonth(a, b)

export const isToday = (date: Date): boolean => isSameDay(date, new Date())

export const getStartOfWeek = (date: Date): Date => startOfWeek(date, { weekStartsOn: 1 })

export const isSameDayFn = (a: Date | string, b: Date | string): boolean => {
  const dateA = typeof a === 'string' ? parseISO(a) : a
  const dateB = typeof b === 'string' ? parseISO(b) : b
  return isSameDay(dateA, dateB)
}

export const isFutureDate = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isAfter(d, new Date())
}

export const isPastDate = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isBefore(d, new Date())
}

export const addWeeksToDate = (date: Date, weeks: number): Date => addWeeks(date, weeks)

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export const getClientFullName = (client: { firstName: string; lastName: string }): string => {
  return `${client.firstName} ${client.lastName}`
}

export const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-scheduled text-white',
  completed: 'bg-completed text-white',
  cancelled: 'bg-cancelled text-white',
  noShow: 'bg-noShow text-white',
}

export const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programado',
  completed: 'Completado',
  cancelled: 'Cancelado',
  noShow: 'No asistió',
}

export const PHOTO_TYPE_LABELS: Record<string, string> = {
  before: 'Antes',
  after: 'Después',
  progress: 'En progreso',
}

export const PHOTO_TYPE_COLORS: Record<string, string> = {
  before: 'bg-before text-white',
  after: 'bg-after text-white',
  progress: 'bg-warning text-white',
}

export const AVATAR_COLORS = [
  'bg-primary text-white',
  'bg-secondary text-white',
  'bg-info text-white',
  'bg-success text-white',
  'bg-warning text-white',
  'bg-error text-white',
]

export const getAvatarColor = (id: string): string => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export const getTimeSlots = (): string[] => {
  const slots: string[] = []
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

export const hapticFeedback = (): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

export interface ProcedureCategory {
  id: string
  label: string
  color: string
}
