import { AttendingField } from '../components/AttendingField'
import type { Profile } from '../types'
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
  const { id, appointmentId } = useParams()
  const { getClient, addAppointment, updateAppointment, appointments } = useStore()
  const client = getClient(id || '')
  const existing = appointments.find(a => a.id === appointmentId && a.clientId === id)
  const [attendedBy, setAttendedBy] = useState<Profile | undefined>(existing?.attendedBy)
  const timeSlots = getTimeSlots()
  if (existing?.time && !timeSlots.includes(existing.time)) timeSlots.push(existing.time)
  timeSlots.sort()

  const [form, setForm] = useState({
    date: existing?.date ?? formatDate(new Date(), 'yyyy-MM-dd'),
    time: existing?.time ?? '09:00',
    procedure: existing?.procedure ?? '',
    notes: existing?.notes ?? '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{
    procedure?: string
    date?: string
    time?: string
  }>({})

  const occupied = new Set(appointments.filter(a =>
    a.id !== existing?.id && a.date === form.date && a.status !== 'cancelled' && existing?.status !== 'cancelled'
  ).map(a => a.time))

  const selectedTime = occupied.has(form.time) ? '' : form.time

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!form.date) {
      newErrors.date = 'La fecha es requerida'
    }

    if (!form.time) {
      newErrors.time = 'La hora es requerida'
    }

    if (occupied.has(form.time)) {
      newErrors.time = 'Ese horario está ocupado. Elegí otra hora o cambiá la fecha.'
    }

    if ((!existing || form.procedure !== (existing.procedure ?? '')) && !isAvailableProcedure(form.procedure)) newErrors.procedure = 'Elegí un motivo de consulta'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const appointmentsWithDates = useMemo(
    () => appointments.map((a) => parseISO(a.date)),
    [appointments]
  )

  if (!client || (appointmentId && !existing)) {
    return (
      <div className="min-h-screen bg-bg">
        <Header title={appointmentId ? 'Turno no encontrado' : 'Paciente no encontrado'} showBack />
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary">{appointmentId ? 'Volvé a la agenda.' : 'El paciente no existe'}</p>
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

    const data = { date: form.date, time: form.time, notes: form.notes.trim() || undefined, attendedBy }
    try {
      if (existing) {
        const procedure = form.procedure !== (existing.procedure ?? '') ? { procedure: form.procedure } : {}
        updateAppointment(existing.id, { ...data, ...procedure })
      } else {
        addAppointment({ ...data, clientId: client.id, procedure: form.procedure, status: 'scheduled' })
      }
      toast({ type: 'success', message: existing ? 'Turno actualizado' : 'Turno agendado' })
      navigate(-1)
    } catch (error) {
      setSubmitted(false)
      toast({ type: 'error', message: error instanceof Error ? error.message : 'No se pudo guardar el turno' })
    }
  }

  const inputClass =
    'w-full bg-card rounded-xl px-4 fluid-sm text-text-primary placeholder:text-text-secondary border border-gray-100 focus:border-primary/30 transition-colors'

  return (
    <div className="app-page readable-screen bg-bg flex flex-col">
      <Header title={existing ? 'Editar turno' : 'Nuevo turno'} showBack />

      <div className="form-center app-content w-full">
        <form onSubmit={handleSubmit} className="appointment-form space-y-4">
          <Card>
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

          <Card>
            <div className="space-y-4">
              <div>
                <label className="fluid-xs font-medium text-text-secondary mb-1.5 block">Fecha</label>
                <DatePicker
                  selected={parseISO(form.date)}
                  onSelect={(date) => { setForm({ ...form, date: formatDate(date, 'yyyy-MM-dd') }); setErrors({}) }}
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
                  value={selectedTime}
                  onChange={(e) => { setForm({ ...form, time: e.target.value }); setErrors(current => ({ ...current, time: undefined })) }}
                  className={inputClass}
                  aria-describedby={errors.time ? 'apt-time-hint apt-time-error' : 'apt-time-hint'}
                  aria-invalid={!!errors.time}
                >
                  <option value="" disabled>Elegí una hora disponible</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot} disabled={occupied.has(slot)}>
                      {slot}{occupied.has(slot) ? ' · Ocupado' : ''}
                    </option>
                  ))}
                </select>
                <p id="apt-time-hint" className="text-sm text-text-secondary mt-1.5">{timeSlots.every(slot => occupied.has(slot)) ? 'No quedan horarios libres. Elegí otra fecha.' : 'Los horarios ocupados no se pueden elegir.'}</p>
                {errors.time && (
                  <p id="apt-time-error" className="text-xs text-error mt-1.5" role="alert">{errors.time}</p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <div>
                <label htmlFor="apt-procedure" className="fluid-xs font-medium text-text-secondary mb-2 block">Motivo de consulta</label>
                <select
                  id="apt-procedure"
                  required={!existing}
                  value={form.procedure}
                  onChange={(e) => setForm({ ...form, procedure: e.target.value })}
                  className={inputClass}
                  aria-invalid={!!errors.procedure}
                  aria-describedby={errors.procedure ? 'apt-procedure-error' : undefined}
                >
                  <option value="" disabled>Elegir motivo de consulta</option>
                  {existing?.procedure && !isAvailableProcedure(existing.procedure) && <option>{existing.procedure}</option>}
                  {PROCEDURES.map((procedure) => <option key={procedure} value={procedure}>{procedure}</option>)}
                </select>
                {errors.procedure && <p id="apt-procedure-error" className="text-xs text-error mt-1.5" role="alert">{errors.procedure}</p>}
              </div>
              <AttendingField value={attendedBy} onChange={setAttendedBy} className={inputClass} />
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
            disabled={submitted || !form.date || !selectedTime}
            className="w-full bg-primary text-white rounded-xl fluid-sm font-semibold press-scale transition-all disabled:opacity-50"
            style={{ height: 'var(--btn-h)' }}
          >
            {submitted ? 'Guardando...' : existing ? 'Guardar cambios' : 'Agendar turno'}
          </button>
        </form>
      </div>
    </div>
  )
}
