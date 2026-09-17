import { addDays, parseISO } from 'date-fns'
import type { Appointment, Client, Notification } from '../types'
import { formatDate, getClientFullName } from './index'

export function getPaymentNotifications(appointments: Appointment[], clients: Client[], now: number): Notification[] {
  return appointments.flatMap((appointment) => {
    if (appointment.paid || (appointment.status !== 'scheduled' && appointment.status !== 'completed')) return []
    const due = addDays(parseISO(`${appointment.date}T${appointment.time}`), 7).getTime()
    if (!Number.isFinite(due) || now <= due) return []
    const client = clients.find((item) => item.id === appointment.clientId)
    if (!client) return []
    return [{
      id: `payment-${appointment.id}`,
      type: 'paymentDue' as const,
      title: `Pago pendiente · ${appointment.procedure || 'Consulta'}`,
      subtitle: `Consulta del ${formatDate(appointment.date, 'dd/MM/yyyy')} a las ${appointment.time} · Más de 7 días sin registrar el pago`,
      clientId: client.id,
      clientName: getClientFullName(client),
      date: appointment.date,
      color: 'red',
    }]
  }).sort((a, b) => a.date.localeCompare(b.date))
}
