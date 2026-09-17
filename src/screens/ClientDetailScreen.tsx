import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera, Calendar, Phone, Mail, Edit, ChevronDown, DollarSign } from 'lucide-react'
import { useStore } from '../store'
import {
  getClientFullName,
  formatDate,
  STATUS_COLORS,
  STATUS_LABELS,
  hapticFeedback,
} from '../utils'
import { Header } from '../components/Header'
import { Card } from '../components/Card'
import { Avatar } from '../components/Avatar'
import { PatientGallery } from '../components/PatientGallery'
import { ConfirmDialog } from '../components/ConfirmDialog'

export function ClientDetailScreen({ toast }: { toast: (args: { type: 'success' | 'error' | 'info'; message: string }) => void }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { getClient, appointments: allAppointments, photos: allPhotos } = useStore()
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null)
  const [openedAt] = useState(() => Date.now())
  const showAllAppointments = expandedClientId === id
  const [confirmDeletePhoto, setConfirmDeletePhoto] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const { deletePhoto, updateAppointment } = useStore()
  const paymentAppointment = allAppointments.find((appointment) => appointment.id === paymentId && appointment.clientId === id)

  const client = getClient(id || '')
  const appointments = useMemo(
    () =>
      allAppointments.filter((appointment) => appointment.clientId === id)
        .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)),
    [id, allAppointments]
  )
  const visibleAppointments = showAllAppointments ? appointments : appointments.slice(0, 2)
  const photos = useMemo(() => allPhotos.filter((photo) => photo.clientId === id), [id, allPhotos])

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

  const quickActions = [
    {
      label: 'Fotos',
      icon: Camera,
      color: 'text-info',
      onClick: () => navigate(`/clients/${id}/photos/new`),
    },
    {
      label: 'Cita',
      icon: Calendar,
      color: 'text-primary',
      onClick: () => navigate(`/clients/${id}/appointments/new`),
    },
  ]

  return (
    <div className="app-page client-detail bg-bg">
      <Header
        title={getClientFullName(client)}
        showBack
        rightAction={
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                hapticFeedback()
                navigate(`/clients/${id}/edit`)
              }}
              className="p-2 press-scale"
              aria-label="Editar paciente"
            >
              <Edit size={22} className="text-primary" />
            </button>
          </div>
        }
        
        
      />

      <main className="app-content app-stack">
        <Card className="animate-scale-in">
          <div className="flex items-center gap-4">
            <Avatar
              firstName={client.firstName}
              lastName={client.lastName}
              id={client.id}
              size="lg"
            />
          
            <div className="flex-1 min-w-0">
              <h2 className="fluid-lg font-semibold text-text-primary">
                {getClientFullName(client)}
              </h2>
              {client.phone && (
                <div className="flex items-center gap-1.5 text-text-secondary fluid-sm">
                  <Phone size={18} />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-1.5 text-text-secondary fluid-sm">
                  <Mail size={18} />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
          {client.notes && (
          <Card className="animate-slide-up stagger-6 opacity-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="fluid-sm font-semibold text-text-secondary">Historia Clínica</p>
            </div>
            <p className="fluid-sm text-text-primary whitespace-pre-wrap">{client.notes}</p>
          </Card>
        )}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={action.label}
              onClick={() => {
                hapticFeedback()
                action.onClick()
              }}
              aria-label={action.label}
              className={`client-quick-action surface flex flex-col items-center gap-2.5 py-5 rounded-2xl press-scale transition-all animate-slide-up stagger-${i + 1} opacity-0`}
            >
              <div className={`p-3 ${action.color}`}>
                <action.icon size={28} />
              </div>
              <span className="fluid-xs font-medium text-text-primary">{action.label}</span>
            </button>
          ))}
        </div>

        <PatientGallery
          photos={photos}
          onAdd={() => navigate(`/clients/${id}/photos/new`)}
          onDelete={setConfirmDeletePhoto}
        />

        {appointments.length > 0 && (
          <div className="animate-slide-up stagger-5 opacity-0">
            <div className="flat-controls flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-3">
              <h3 className="fluid-sm font-semibold text-text-secondary">Últimos turnos</h3>
              {appointments.length > 2 && (
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-1.5 border-0 bg-transparent fluid-xs font-semibold text-primary hover:text-primary-dark"
                  aria-expanded={showAllAppointments}
                  aria-controls="client-appointments"
                  onClick={() => setExpandedClientId(showAllAppointments ? null : id ?? null)}
                >
                  {showAllAppointments ? 'Ver menos' : 'Todos los turnos'}
                  <ChevronDown size={16} className={showAllAppointments ? 'rotate-180' : ''} aria-hidden="true" />
                </button>
              )}
            </div>
            <div id="client-appointments" className="space-y-2">
              {visibleAppointments.map((apt) => (
                <Card key={apt.id} padding={false} className="p-3">
                  <div className="flat-controls flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="fluid-sm font-bold text-primary">{apt.time}</span>
                        {!(apt.status === 'scheduled' && new Date(`${apt.date}T${apt.time}`).getTime() < openedAt) && (
                          <span className={`fluid-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[apt.status]}`} aria-label={`Estado: ${STATUS_LABELS[apt.status]}`}>
                            {STATUS_LABELS[apt.status]}
                          </span>
                        )}
                      </div>
                      <p className="fluid-xs text-text-secondary mt-0.5">
                        {formatDate(apt.date, 'dd MMM yyyy')}
                      </p>
                      {apt.procedure && <p className="fluid-xs text-text-secondary mt-1 break-words">{apt.procedure}</p>}
                    </div>
                    <button
                      type="button"
                      className={`payment-button ${apt.paid ? 'is-paid' : ''}`}
                      aria-label={`${apt.paid ? 'Pagado. Cambiar a pendiente' : 'Sin pagar. Registrar pago'}: ${apt.procedure || 'Consulta'} del ${formatDate(apt.date, 'dd/MM/yyyy')} a las ${apt.time}`}
                      aria-pressed={!!apt.paid}
                      title={apt.paid ? 'Pagado' : 'Sin pagar'}
                      onClick={() => { hapticFeedback(); setPaymentId(apt.id) }}
                    >
                      <DollarSign size={26} strokeWidth={2.5} aria-hidden="true" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

      </main>

      {paymentAppointment && <ConfirmDialog
        open
        title={paymentAppointment.paid ? 'Cambiar a pendiente' : 'Confirmar pago'}
        message={paymentAppointment.paid
          ? `¿Querés marcar como no pagada la consulta de ${paymentAppointment.procedure || 'Consulta'} del ${formatDate(paymentAppointment.date, 'dd/MM/yyyy')} a las ${paymentAppointment.time}?`
          : `¿${getClientFullName(client)} pagó la consulta de ${paymentAppointment.procedure || 'Consulta'} del ${formatDate(paymentAppointment.date, 'dd/MM/yyyy')} a las ${paymentAppointment.time}?`}
        confirmLabel={paymentAppointment.paid ? 'Marcar pendiente' : 'Sí, pagó'}
        cancelLabel="Cancelar"
        variant="payment"
        onConfirm={() => {
          try {
            updateAppointment(paymentAppointment.id, { paid: !paymentAppointment.paid })
            setPaymentId(null)
            toast({ type: 'success', message: paymentAppointment.paid ? 'Pago marcado como pendiente' : 'Pago registrado' })
          } catch {
            toast({ type: 'error', message: 'No se pudo guardar el pago. Intentá nuevamente.' })
          }
        }}
        onCancel={() => setPaymentId(null)}
      />}

      {!paymentAppointment && <ConfirmDialog
        open={confirmDeletePhoto !== null}
        title="Eliminar foto"
        message="¿Estás seguro de que querés eliminar esta foto? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (confirmDeletePhoto) {
            deletePhoto(confirmDeletePhoto)
            setConfirmDeletePhoto(null)
            toast({ type: 'info', message: 'Foto eliminada' })
          }
        }}
        onCancel={() => setConfirmDeletePhoto(null)}
      />}

    </div>
  )
}
