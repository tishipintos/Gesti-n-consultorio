import { useState, useMemo, useEffect } from 'react'
import { parseISO } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Clock, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import {
  getMonthDays,
  isToday,
  isSameDayFn,
  isSameMonthFn,
  formatDate,
  formatTime,
  STATUS_COLORS,
  STATUS_LABELS,
  getClientFullName,
  addMonthsToDate,
  hapticFeedback,
} from '../utils'
import { Header } from '../components/Header'
import { Card } from '../components/Card'
import { FAB } from '../components/FAB'
import { EmptyState } from '../components/EmptyState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Skeleton } from '../components/Skeleton'
import { QuickAppointmentDialog } from '../components/QuickAppointmentDialog'

export function CalendarScreen({ toast }: { toast: (args: { type: 'success' | 'error' | 'info'; message: string }) => void }) {
  const navigate = useNavigate()
  const { clients, appointments, deleteAppointment } = useStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const refresh = () => {
      setNow(Date.now())
      timer = setTimeout(refresh, 60000 - (Date.now() % 60000))
    }
    const onFocus = () => { clearTimeout(timer); refresh() }
    refresh()
    window.addEventListener('focus', onFocus)
    return () => { clearTimeout(timer); window.removeEventListener('focus', onFocus) }
  }, [])

  const nextAppointmentId = useMemo(() => appointments
    .filter((appointment) => appointment.status === 'scheduled' && parseISO(appointment.date + 'T' + appointment.time).getTime() >= now)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0]?.id,
  [appointments, now])

  const days = useMemo(() => getMonthDays(currentMonth), [currentMonth])

  const appointmentsForDate = useMemo(() => {
    const dateStr = formatDate(selectedDate, 'yyyy-MM-dd')
    return appointments
      .filter((a) => a.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((a) => ({
        ...a,
        client: clients.find((c) => c.id === a.clientId),
      }))
  }, [appointments, clients, selectedDate])

  const appointmentsCountByDate = useMemo(() => {
    const map: Record<string, number> = {}
    appointments.forEach((a) => {
      map[a.date] = (map[a.date] || 0) + 1
    })
    return map
  }, [appointments])

  const todayCount = useMemo(() => {
    const today = formatDate(new Date(), 'yyyy-MM-dd')
    return appointmentsCountByDate[today] || 0
  }, [appointmentsCountByDate])

  const handlePrevMonth = () => {
    hapticFeedback()
    setCurrentMonth((prev) => addMonthsToDate(prev, -1))
  }

  const handleNextMonth = () => {
    hapticFeedback()
    setCurrentMonth((prev) => addMonthsToDate(prev, 1))
  }

  const handleToday = () => {
    const today = new Date()
    hapticFeedback()
    setCurrentMonth(today)
    setSelectedDate(today)
  }

  const handleDelete = (id: string) => {
    hapticFeedback()
    setConfirmDelete(null)
    deleteAppointment(id)
    toast({ type: 'info', message: 'Turno eliminado' })
  }

  return (
    <div className="app-page bg-bg flex flex-col">
      <Header
        title="Agenda"
        rightAction={
          todayCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full animate-scale-in">
              {todayCount}
            </span>
          )
        }
      />

      <main className="app-content app-stack">
        <Card padding={false} className="flat-controls">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <button onClick={handlePrevMonth} className="w-10 h-10 -ml-1 rounded-full bg-primary/8 text-primary flex items-center justify-center press-scale" aria-label="Mes anterior">
              <ChevronLeft size={22} className="text-text-secondary" />
            </button>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base font-extrabold text-text-primary capitalize tracking-[-0.02em]" aria-live="polite">
                {formatDate(currentMonth, 'MMMM yyyy')}
              </span>
              <button onClick={handleToday} className="fluid-xs text-primary font-bold press-scale" type="button">
                Ir a hoy
              </button>
            </div>
            <button onClick={handleNextMonth} className="w-10 h-10 -mr-1 rounded-full bg-primary/8 text-primary flex items-center justify-center press-scale" aria-label="Mes siguiente">
              <ChevronRight size={22} className="text-text-secondary" />
            </button>
          </div>

          <div className="calendar-grid px-4 mb-1">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((label) => (
              <div key={label} className="text-center fluid-xs font-semibold text-text-muted py-1 uppercase tracking-wider">
                {label}
              </div>
            ))}
          </div>

          <div className="calendar-grid px-4 pb-4">
            {days.map((day, i) => {
              const today = isToday(day)
              const selected = isSameDayFn(day, selectedDate)
              const inMonth = isSameMonthFn(day, currentMonth)
              const dateStr = formatDate(day, 'yyyy-MM-dd')
              const count = appointmentsCountByDate[dateStr] || 0

              return (
                <button
                  key={i}
                  onClick={() => {
                    hapticFeedback()
                    setSelectedDate(day)
                  }}
                  className={`calendar-cell min-h-12 transition-all duration-200 press-scale ${
                    !inMonth
                      ? 'text-text-muted/30'
                      : selected
                      ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.03]'
                      : today
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-primary hover:bg-gray-50'
                  }`}
                  aria-label={`${formatDate(day, 'EEEE d')} de ${formatDate(day, 'MMMM')}${count > 0 ? `, ${count} turnos` : ''}`}
                  aria-pressed={selected}
                >
                  <span className={`fluid-sm font-semibold ${today && !selected ? 'text-primary' : ''}`}>
                    {formatDate(day, 'd')}
                  </span>
                  {inMonth && count > 0 && (
                    <div className="flex gap-[3px] mt-1">
                      {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                        <div
                          key={j}
                          className={`w-1 h-1 rounded-full ${
                            selected ? 'bg-white/80' : 'bg-primary'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </Card>

        <section className="flex-1" aria-labelledby="agenda-heading">
          <h2 id="agenda-heading" className="text-lg font-extrabold text-text-primary mb-0.5 tracking-[-0.025em] capitalize">
            Turnos — {formatDate(selectedDate, 'EEEE d')}
          </h2>
          <div className="flex items-center justify-between mb-4">
            <p className="fluid-xs text-text-secondary capitalize">{formatDate(selectedDate, "MMMM 'de' yyyy")}</p>
            {appointmentsForDate.length > 0 && (
              <span className="fluid-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {appointmentsForDate.length} {appointmentsForDate.length === 1 ? 'turno' : 'turnos'}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Skeleton variant="text" className="w-16 mb-2" />
                      <Skeleton variant="text" className="w-32 mb-1" />
                      <Skeleton variant="text" className="w-24" />
                    </div>
                    <Skeleton variant="rect" className="w-8 h-8" />
                  </div>
                </Card>
              ))}
            </div>
          ) : appointmentsForDate.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center">
              <EmptyState
                icon={<Clock size={48} />}
                title="Sin turnos"
                description="No hay turnos programados para este día. Agendá el primer turno desde el botón de abajo."
                action={{
                  label: 'Agendar turno',
                  onClick: () => setBookingOpen(true),
                }}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {appointmentsForDate.map((appointment, index) => (
                <article key={appointment.id} className={`relative grid grid-cols-[0.75rem_max-content_minmax(0,1fr)] gap-x-2 animate-slide-up stagger-${Math.min(index + 1, 6)} opacity-0`}>
                  <div className="relative" aria-hidden="true">
                    {index > 0 && <span className="absolute left-1/2 top-0 bottom-1/2 w-px -translate-x-1/2 bg-primary/25" />}
                    {index < appointmentsForDate.length - 1 && (
                      <span className="absolute left-1/2 top-1/2 -bottom-2 w-px -translate-x-1/2 bg-primary/25" />
                    )}
                    <span className={`absolute top-1/2 -translate-y-1/2 left-0 w-3 h-3 rounded-full border-2 border-primary ${appointment.id === nextAppointmentId ? 'bg-primary' : 'bg-bg'}`} />
                  </div>
                  <div className="self-center text-right whitespace-nowrap">
                    <time dateTime={appointment.date + 'T' + appointment.time} className="block text-sm leading-5 font-extrabold text-primary tabular-nums">
                      {formatTime(appointment.time)}
                    </time>
                    {appointment.id === nextAppointmentId && <span className="sr-only">Pr?xima consulta</span>}
                  </div>
                  <div className={`rounded-2xl px-4 py-3.5 shadow-sm ${index % 3 === 0 ? 'bg-primary/10' : index % 3 === 1 ? 'bg-secondary/10' : 'bg-accent/10'}`}>
                    <div className="flat-controls flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        {appointment.client && (
                          <p className="fluid-sm font-bold text-text-primary truncate">
                            {getClientFullName(appointment.client)}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {appointment.procedure && (
                            <p className="fluid-xs text-text-secondary break-words">{appointment.procedure}</p>
                          )}
                          {!(appointment.status === 'scheduled' && parseISO(appointment.date + 'T' + appointment.time).getTime() < now) && (
                            <span className={`fluid-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[appointment.status]}`} aria-label={`Estado: ${STATUS_LABELS[appointment.status]}`}>
                              {STATUS_LABELS[appointment.status]}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          hapticFeedback()
                          setConfirmDelete(appointment.id)
                        }}
                        className="-mt-1 -mr-2 p-2 min-w-11 min-h-11 flex items-center justify-center shrink-0 text-text-secondary hover:text-error transition-colors press-scale rounded-xl"
                        aria-label="Eliminar turno"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <FAB onClick={() => setBookingOpen(true)} label="Agendar" />
      {bookingOpen && (
        <QuickAppointmentDialog
          initialDate={formatDate(selectedDate, 'yyyy-MM-dd')}
          onClose={() => setBookingOpen(false)}
          onCreateClient={() => { setBookingOpen(false); navigate('/clients/new') }}
          onSaved={(date) => {
            setSelectedDate(parseISO(date))
            setCurrentMonth(parseISO(date))
            setBookingOpen(false)
            toast({ type: 'success', message: 'Turno agendado' })
          }}
        />
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Eliminar turno"
        message="¿Estás seguro de que querés eliminar este turno? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (confirmDelete) {
            handleDelete(confirmDelete)
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
