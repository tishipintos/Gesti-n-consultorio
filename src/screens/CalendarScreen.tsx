import { Link } from 'react-router-dom'
import { appointmentAttribution } from '../utils/profiles'
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

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
    <div className="app-page agenda-page wide-page bg-bg flex flex-col">
      <Header
        title="Agenda"
        rightAction={
          todayCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {todayCount}
            </span>
          )
        }
      />

      <main className="app-content app-stack agenda-layout">
        <section className="agenda-month flat-controls" aria-label="Calendario mensual">
          <div className="agenda-month-toolbar">
            <span className="agenda-month-title" aria-live="polite">{formatDate(currentMonth, 'MMMM yyyy')}</span>
            <button onClick={handleToday} className="calendar-today" type="button">Hoy</button>
            <button onClick={handlePrevMonth} aria-label="Mes anterior">
              <ChevronLeft size={22} className="text-text-secondary" />
            </button>
            <button onClick={handleNextMonth} aria-label="Mes siguiente">
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
                  className={`calendar-cell min-h-9 transition-all duration-200 press-scale ${
                    !inMonth
                      ? 'text-text-muted'
                      : selected
                      ? 'bg-primary text-white'
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
        </section>

        <section className="flex-1" aria-labelledby="agenda-heading">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[#d9cfbb] pb-3 mb-4">
            <span aria-hidden="true" className="text-4xl font-extrabold leading-none tracking-tight tabular-nums text-text-primary">{formatDate(selectedDate, 'd')}</span>
            <div className="flex-1 min-w-0">
              <h2 id="agenda-heading" className="text-base font-extrabold capitalize">
                {formatDate(selectedDate, 'EEEE')}<span className="sr-only"> {formatDate(selectedDate, 'd')}</span>
              </h2>
              <p className="text-sm text-text-secondary">{formatDate(selectedDate, "MMMM 'de' yyyy")}</p>
            </div>
            <span className="text-sm font-semibold text-text-secondary tabular-nums">
              {appointmentsForDate.length} {appointmentsForDate.length === 1 ? 'turno' : 'turnos'}
            </span>
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
            <div>
              {appointmentsForDate.map((appointment) => (
                <article key={appointment.id} className="agenda-appointment">
                  <div className="agenda-appointment-body">
                    <div className="flat-controls flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        {appointment.client && (
                          <p className="fluid-sm font-bold text-text-primary break-words">
                            {getClientFullName(appointment.client)}
                            {' · '}
                            <time dateTime={appointment.date + 'T' + appointment.time} className="font-normal text-text-secondary whitespace-nowrap">{formatTime(appointment.time)}</time>
                          </p>
                        )}
                        <p className="fluid-xs text-text-secondary break-words">{appointment.procedure || 'Consulta'}</p>
                        <p className="text-xs text-text-secondary break-words">{appointmentAttribution(appointment)}</p>
                        {appointment.client && <Link className="inline-flex items-center min-h-11 text-sm font-semibold text-primary underline" to={'/clients/' + appointment.clientId + '/appointments/' + appointment.id + '/edit'}>Editar turno</Link>}
                      </div>
                      <button
                        onClick={() => {
                          hapticFeedback()
                          setConfirmDelete(appointment.id)
                        }}
                        className="p-2 min-w-11 min-h-11 flex items-center justify-center shrink-0 text-text-secondary hover:text-error transition-colors press-scale rounded-xl"
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

      <FAB onClick={() => setBookingOpen(true)} label="Agendar" appointment />
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
