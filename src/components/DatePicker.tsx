import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  isToday,
  format,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { hapticFeedback } from '../utils'

interface DatePickerProps {
  selected: Date | null
  onSelect: (date: Date) => void
  appointmentsWithDates?: Date[]
  minDate?: Date
  maxDate?: Date
  className?: string
}

const WEEKDAY_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

export function DatePicker({
  selected,
  onSelect,
  appointmentsWithDates = [],
  minDate,
  maxDate,
  className = '',
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date())
  const [focusedDate, setFocusedDate] = useState<Date | null>(null)

  const appointmentDates = useMemo(() => {
    const set = new Set<string>()
    appointmentsWithDates.forEach((d) => {
      set.add(format(d, 'yyyy-MM-dd'))
    })
    return set
  }, [appointmentsWithDates])

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const result: Date[] = []
    let day = calStart
    while (isBefore(day, calEnd) || isSameDay(day, calEnd)) {
      result.push(day)
      day = addDays(day, 1)
    }
    return result
  }, [currentMonth])

  const isDisabled = useCallback(
    (date: Date): boolean => {
      if (minDate && isBefore(date, minDate)) return true
      if (maxDate && isBefore(maxDate, date)) return true
      return false
    },
    [minDate, maxDate]
  )

  const handlePrevMonth = () => {
    hapticFeedback()
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    hapticFeedback()
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  const handleSelect = (date: Date) => {
    if (isDisabled(date)) return
    hapticFeedback()
    onSelect(date)
  }

  const handleKeyDown = (e: React.KeyboardEvent, date: Date) => {
    let newDate: Date | null = null

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        newDate = addDays(date, -1)
        break
      case 'ArrowRight':
        e.preventDefault()
        newDate = addDays(date, 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        newDate = addDays(date, -7)
        break
      case 'ArrowDown':
        e.preventDefault()
        newDate = addDays(date, 7)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        handleSelect(date)
        return
      default:
        return
    }

    if (newDate) {
      setFocusedDate(newDate)
      if (!isSameMonth(newDate, currentMonth)) {
        setCurrentMonth(startOfMonth(newDate))
      }
    }
  }

  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: es })

  return (
    <div className={`flat-controls rounded-xl bg-primary/[0.035] p-2 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors press-scale"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} className="text-text-secondary" />
        </button>
        <span className="fluid-sm font-semibold text-text-primary capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors press-scale"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} className="text-text-secondary" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center fluid-xs font-medium text-text-secondary py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5" role="grid" aria-label="Calendario">
        {days.map((day) => {
          const inMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)
          const isSelected = selected ? isSameDay(day, selected) : false
          const disabled = isDisabled(day) || !inMonth
          const dateStr = format(day, 'yyyy-MM-dd')
          const hasAppointment = appointmentDates.has(dateStr)
          const focused = focusedDate ? isSameDay(day, focusedDate) : false

          return (
            <button
              key={dateStr}
              type="button"
              data-date={dateStr}
              disabled={disabled}
              onClick={() => handleSelect(day)}
              onKeyDown={(e) => handleKeyDown(e, day)}
              onFocus={() => setFocusedDate(day)}
              tabIndex={isSelected || (!focusedDate && today) ? 0 : -1}
              aria-label={`${format(day, 'd MMMM yyyy', { locale: es })}${isSelected ? ', seleccionado' : ''}${hasAppointment ? ', con turnos' : ''}`}
              aria-selected={isSelected}
              role="gridcell"
              className={`relative flex flex-col items-center justify-center py-2 rounded-xl fluid-sm transition-all duration-150 press-scale ${
                disabled
                  ? 'text-text-secondary/30 cursor-not-allowed'
                  : isSelected
                  ? 'bg-primary text-white font-semibold'
                  : today
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-text-primary hover:bg-gray-100'
              } ${focused && !isSelected ? 'ring-2 ring-primary/40' : ''}`}
            >
              <span>{format(day, 'd')}</span>
              {hasAppointment && !isSelected && (
                <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
              {hasAppointment && isSelected && (
                <div className="w-1 h-1 rounded-full bg-white/80 mt-0.5" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
