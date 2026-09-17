import { PROCEDURES, isAvailableProcedure } from '../utils/procedures'
import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { Header } from '../components/Header'
import { Card } from '../components/Card'
import { Avatar } from '../components/Avatar'
import { DatePicker } from '../components/DatePicker'
import { getClientFullName, formatDate, getTimeSlots, hapticFeedback } from '../utils'
import { parseISO } from 'date-fns'

export function AppointmentFormScreen({ toast }: { toast: (args: { type: 'success' | 'error' | 'info'; message: string }) => void }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { getClient, addAppointment, appointments } = useStore()
  const client = getClient(id || '')
  const timeSlots = useMemo(() => getTimeSlots(), [])

  const [form, setForm] = useState({
    date: formatDate(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    procedure: '',
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{
    procedure?: string
    date?: string
    time?: string
  }>({})

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!form.date) {
      newErrors.date = 'La fecha es requerida'
    }

    if (!form.time) {
      newErrors.time = 'La hora es requerida'
    }

    if (form.date && form.time) {
      const hasConflict = appointments.some(
        (a) => a.date === form.date && a.time === form.time && a.status !== 'cancelled'
      )
      if (hasConflict) {
        newErrors.time = 'Ya hay un turno agendado para esta fecha y hora'
      }
    }

    if (!isAvailableProcedure(form.procedure)) newErrors.procedure = 'Elegí un motivo de consulta'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const appointmentsWithDates = useMemo(
    () => appointments.map((a) => parseISO(a.date)),
    [appointments]
  )

  if (!client) {
    return (
      <div className="min-h-screen bg-bg">
        <Header title="Paciente no encontrado" showBack />
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary">El paciente no existe</p>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    hapticFeedback()

    if (!validate()) {
      return
    }

    setSubmitted(true)

    addAppointment({
      clientId: client.id,
      date: form.date,
      time: form.time,
      procedure: form.procedure,
      notes: form.notes.trim() || undefined,
      status: 'scheduled',
    })

    toast({ type: 'success', message: 'Turno agendado' })
    navigate(-1)
  }

  const inputClass =
    'w-full bg-card rounded-xl px-4 fluid-sm text-text-primary placeholder:text-text-secondary border border-gray-100 focus:border-primary/30 transition-colors'

  return (
    <div className="app-page readable-screen bg-bg flex flex-col">
      <Header title="Nuevo turno" showBack />

      <div className="form-center app-content w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="animate-slide-up stagger-1 opacity-0">
            <div className="flex items-center gap-3">
              <Avatar firstName={client.firstName} lastName={client.lastName} id={client.id} />
              <div>
                <p className="text-base font-semibold text-text-primary">
                  {getClientFullName(client)}
                </p>
                <p className="text-sm text-text-secondary">Paciente</p>
              </div>
            </div>
          </Card>

          <Card className="animate-slide-up stagger-2 opacity-0">
            <div className="space-y-4">
              <div>
                <label className="fluid-xs font-medium text-text-secondary mb-1.5 block">Fecha</label>
                <DatePicker
                  selected={parseISO(form.date)}
                  onSelect={(date) => setForm({ ...form, date: formatDate(date, 'yyyy-MM-dd') })}
                  appointmentsWithDates={appointmentsWithDates}
                />
                {errors.date && (
                  <p className="text-xs text-error mt-1.5" role="alert">{errors.date}</p>
                )}
              </div>
              <div>
                <label htmlFor="apt-time" className="fluid-xs font-medium text-text-secondary mb-1.5 block">Hora</label>
                <select
                  id="apt-time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className={inputClass}
                  aria-describedby={errors.time ? 'apt-time-error' : undefined}
                  aria-invalid={!!errors.time}
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {errors.time && (
                  <p id="apt-time-error" className="text-xs text-error mt-1.5" role="alert">{errors.time}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="animate-slide-up stagger-3 opacity-0">
            <div className="space-y-4">
              <div>
                <label htmlFor="apt-procedure" className="fluid-xs font-medium text-text-secondary mb-2 block">Motivo de consulta</label>
                <select
                  id="apt-procedure"
                  required
                  value={form.procedure}
                  onChange={(e) => setForm({ ...form, procedure: e.target.value })}
                  className={inputClass}
                  aria-invalid={!!errors.procedure}
                  aria-describedby={errors.procedure ? 'apt-procedure-error' : undefined}
                >
                  <option value="" disabled>Elegir motivo de consulta</option>
                  {PROCEDURES.map((procedure) => <option key={procedure} value={procedure}>{procedure}</option>)}
                </select>
                {errors.procedure && <p id="apt-procedure-error" className="text-xs text-error mt-1.5" role="alert">{errors.procedure}</p>}
              </div>
              <div>
                <label htmlFor="apt-notes" className="fluid-xs font-medium text-text-secondary mb-1.5 block">Notas</label>
                <textarea
                  id="apt-notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notas adicionales..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </Card>

          <button
            type="submit"
            disabled={submitted || !form.date || !form.time}
            className="w-full bg-primary text-white rounded-xl fluid-sm font-semibold press-scale transition-all disabled:opacity-50 animate-slide-up stagger-4 opacity-0"
            style={{ height: 'var(--btn-h)' }}
          >
            {submitted ? 'Agendando...' : 'Agendar turno'}
          </button>
        </form>
      </div>
    </div>
  )
}
