import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { Header } from '../components/Header'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Card } from '../components/Card'
import { hapticFeedback } from '../utils'

export function ClientFormScreen({ toast }: { toast: (args: { type: 'success' | 'error' | 'info'; message: string }) => void }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { getClient, addClient, updateClient, deleteClient } = useStore()
  const isEditing = Boolean(id)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (id) {
      const client = getClient(id)
      if (client) {
        setForm({
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone || '',
          email: client.email || '',
          dateOfBirth: client.dateOfBirth || '',
          notes: client.notes || '',
        })
      }
    }
  }, [id, getClient])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!form.firstName.trim()) newErrors.firstName = 'El nombre es requerido'
    if (!form.lastName.trim()) newErrors.lastName = 'El apellido es requerido'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email inválido'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    hapticFeedback()
    if (!validate()) return

    setSubmitted(true)

    if (isEditing && id) {
      updateClient(id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        notes: form.notes.trim() || undefined,
      })
      toast({ type: 'success', message: 'Paciente actualizado' })
      navigate(-1)
    } else {
      const newClient = addClient({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        notes: form.notes.trim() || undefined,
      })
      toast({ type: 'success', message: 'Paciente creado' })
      navigate(`/clients/${newClient.id}`)
    }
  }

  const inputClass = (field: string) =>
    `w-full bg-card rounded-xl px-4 fluid-sm text-text-primary placeholder-text-secondary/50 border transition-colors ${
      errors[field] ? 'border-error' : 'border-gray-100 focus:border-primary/30'
    }`

  return (
    <div className="app-page bg-bg flex flex-col">
      <Header title={isEditing ? 'Editar paciente' : 'Nuevo paciente'} showBack />

      <div className="form-center app-content w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="animate-slide-up stagger-1 opacity-0">
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="fluid-xs font-medium text-text-secondary mb-1.5 block">Nombre *</label>
                <input
                  id="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Nombre"
                  required
                  aria-required="true"
                  aria-invalid={errors.firstName ? 'true' : undefined}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  className={inputClass('firstName')}
                />
                {errors.firstName && (
                  <p id="firstName-error" className="text-xs text-error mt-1.5" role="alert">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="fluid-xs font-medium text-text-secondary mb-1.5 block">Apellido *</label>
                <input
                  id="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Apellido"
                  required
                  aria-required="true"
                  aria-invalid={errors.lastName ? 'true' : undefined}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  className={inputClass('lastName')}
                />
                {errors.lastName && (
                  <p id="lastName-error" className="text-xs text-error mt-1.5" role="alert">{errors.lastName}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="animate-slide-up stagger-2 opacity-0">
            <div className="space-y-4">
              <div>
                <label htmlFor="dateOfBirth" className="fluid-xs font-medium text-text-secondary mb-1.5 block">Fecha de nacimiento</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className={inputClass('dateOfBirth')}
                />
              </div>
              <div>
                <label htmlFor="phone" className="fluid-xs font-medium text-text-secondary mb-1.5 block">Teléfono</label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Ej: 11 1234-5678"
                  className={inputClass('phone')}
                />
              </div>
              <div>
                <label htmlFor="email" className="fluid-xs font-medium text-text-secondary mb-1.5 block">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  aria-invalid={errors.email ? 'true' : undefined}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={inputClass('email')}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-error mt-1.5" role="alert">{errors.email}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="animate-slide-up stagger-3 opacity-0">
            <div>
              <label htmlFor="notes" className="fluid-xs font-medium text-text-secondary mb-1.5 block">Historia Clínica</label>
              <textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Historia clínica, observaciones, antecedentes, etc."
                rows={3}
                className={`${inputClass('notes')} resize-none`}
              />
            </div>
          </Card>

          <button
            type="submit"
            disabled={submitted}
            className="w-full bg-primary text-white rounded-xl fluid-sm font-semibold press-scale transition-all disabled:opacity-50 animate-slide-up stagger-4 opacity-0"
            style={{ height: 'var(--btn-h)' }}
          >
            {submitted ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear paciente'}
          </button>
        </form>
        {isEditing && getClient(id || '') && (
          <div className="flat-controls mt-8 pt-5 border-t border-error/15">
            <button type="button" onClick={() => setConfirmDelete(true)} className="w-full min-h-12 text-error font-semibold rounded-xl press-scale">Eliminar paciente</button>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={isEditing && confirmDelete}
        title="Eliminar paciente"
        message="Se eliminarán el paciente, sus turnos y sus fotos. Esta acción no se puede deshacer."
        confirmLabel="Eliminar paciente"
        variant="danger"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (!id || !getClient(id)) return
          deleteClient(id)
          setConfirmDelete(false)
          toast({ type: 'info', message: 'Paciente eliminado' })
          navigate('/clients', { replace: true })
        }}
      />
    </div>
  )
}
