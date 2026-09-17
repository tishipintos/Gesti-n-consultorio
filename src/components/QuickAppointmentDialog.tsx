import { PROCEDURES, isAvailableProcedure } from '../utils/procedures'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronRight, Search, X } from 'lucide-react'
import { useStore } from '../store'
import { getClientFullName, getTimeSlots, hapticFeedback } from '../utils'
import { Avatar } from './Avatar'

interface Props {
  initialDate: string
  onClose: () => void
  onSaved: (date: string) => void
  onCreateClient: () => void
}

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim()
const slots = getTimeSlots()

export function QuickAppointmentDialog({ initialDate, onClose, onSaved, onCreateClient }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const savingRef = useRef(false)
  const { clients, appointments, addAppointment } = useStore()
  const [search, setSearch] = useState('')
  const [clientId, setClientId] = useState<string | null>(null)
  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState('')
  const [procedure, setProcedure] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const client = clients.find((item) => item.id === clientId)
  const query = normalize(search)
  const matches = clients.filter((item) => normalize([getClientFullName(item), item.phone, item.email].filter(Boolean).join(' ')).includes(query))
  const occupied = new Set(appointments.filter((item) => item.date === date && item.status !== 'cancelled').map((item) => item.time))
  const available = slots.filter((slot) => !occupied.has(slot))

  useEffect(() => {
    const dialog = dialogRef.current!
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    searchRef.current?.focus()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  useEffect(() => {
    if (clientId) dateRef.current?.focus()
    else searchRef.current?.focus()
  }, [clientId])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (savingRef.current) return
    const latest = useStore.getState()
    if (!client || !latest.clients.some((item) => item.id === client.id)) {
      setError('Elegí un cliente para continuar.')
      return
    }
    if (!date || !time || !slots.includes(time)) {
      setError('Elegí una fecha y una hora disponible.')
      return
    }
    if (latest.appointments.some((item) => item.date === date && item.time === time && item.status !== 'cancelled')) {
      setError('Ese horario ya está ocupado. Elegí otro.')
      return
    }
    if (!isAvailableProcedure(procedure)) {
      setError('Elegí un motivo de consulta.')
      return
    }
    savingRef.current = true
    try {
      addAppointment({ clientId: client.id, date, time, procedure, notes: notes.trim() || undefined, status: 'scheduled' })
    } catch {
      savingRef.current = false
      setError('No se pudo guardar el turno. Intente nuevamente.')
      return
    }
    hapticFeedback()
    onSaved(date)
  }

  return (
    <dialog ref={dialogRef} className="quick-appointment" aria-labelledby="quick-appointment-title" onCancel={(event) => { event.preventDefault(); onClose() }}>
      <div className="quick-appointment-header flat-controls">
        {clientId && <button type="button" onClick={() => { setClientId(null); setError('') }} aria-label="Volver a elegir cliente" className="p-2 text-primary"><ArrowLeft size={22} /></button>}
        <h2 id="quick-appointment-title" className="text-xl font-bold flex-1">{clientId ? 'Agendar turno' : '¿Para quién es el turno?'}</h2>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="p-2 text-text-secondary"><X size={22} /></button>
      </div>
      {!clientId ? (
        <div className="quick-appointment-body">
          <div className="client-search surface" style={{ marginBottom: '1rem' }}>
            <Search size={22} aria-hidden="true" />
            <input ref={searchRef} type="search" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Buscar clientes por nombre, tel?fono o email" placeholder="Buscar cliente?" />
          </div>
          <p className="text-sm text-text-secondary mb-3" role="status">{matches.length} {matches.length === 1 ? 'cliente' : 'clientes'}</p>
          <div className="quick-client-list flat-controls">
            {matches.map((item) => (
              <button type="button" key={item.id} className="quick-client-row" onClick={() => { setClientId(item.id); hapticFeedback() }}>
                <Avatar firstName={item.firstName} lastName={item.lastName} id={item.id} />
                <span className="flex-1 min-w-0 text-left">
                  <span className="block font-semibold break-words">{getClientFullName(item)}</span>
                  {(item.phone || item.email) && <span className="block text-sm text-text-secondary break-all">{item.phone || item.email}</span>}
                </span>
                <ChevronRight size={20} className="shrink-0 text-primary" aria-hidden="true" />
              </button>
            ))}
          </div>
          {matches.length === 0 && <p className="text-text-secondary py-4">{clients.length ? 'No encontramos clientes con esos datos. Probá con otro nombre o teléfono.' : 'Agregá tu primer cliente para poder agendar un turno.'}</p>}
          {clients.length === 0 && <button type="button" onClick={onCreateClient} className="w-full min-h-12 bg-primary text-white font-semibold mt-4">Agregar cliente</button>}
        </div>
      ) : (
        <form onSubmit={submit} className="quick-appointment-body">
          <p className="text-text-secondary mb-5">Para <strong className="text-text-primary break-words">{client ? getClientFullName(client) : 'cliente no disponible'}</strong></p>
          <div className="quick-date-time">
            <label>Fecha<input ref={dateRef} type="date" required value={date} onChange={(event) => { setDate(event.target.value); setTime(''); setError('') }} /></label>
            <label>Hora<select required value={time} onChange={(event) => { setTime(event.target.value); setError('') }} disabled={!date || available.length === 0}>
              <option value="">Elegir hora</option>
              {slots.map((slot) => <option key={slot} value={slot} disabled={occupied.has(slot)}>{slot}{occupied.has(slot) ? ' ? Ocupado' : ''}</option>)}
            </select></label>
          </div>
          {date && available.length === 0 && <p className="text-error mt-3" role="status">No quedan horarios libres. Elegí otra fecha.</p>}
          <label className="mt-5">Motivo de consulta
            <select required value={procedure} onChange={(event) => { setProcedure(event.target.value); setError('') }}>
              <option value="" disabled>Elegir motivo de consulta</option>
              {PROCEDURES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <details className="quick-optional">
            <summary>Agregar notas <span className="text-sm text-text-secondary">(opcional)</span></summary>
            <label>Notas<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} placeholder="Detalles del turno" /></label>
          </details>
          {error && <p className="text-error mb-4" role="alert">{error}</p>}
          <button type="submit" disabled={!client || !date || !time || occupied.has(time)} className="w-full min-h-12 bg-primary text-white font-semibold press-scale disabled:opacity-50">Confirmar turno</button>
        </form>
      )}
    </dialog>
  )
}
