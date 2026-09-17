import { addDays, addMonths, format, parseISO } from 'date-fns'
import type { Appointment, Client, Notification } from '../types'

export const PROCEDURES = ['Consulta diagnóstica', 'Botox', 'Hidroxiapatita de calcio', 'Mesoterapia', 'Exosomas', 'Hilos', 'Limpieza facial', 'Blefaroplastia', 'Exeresis nevo/lesión', 'Corporal'] as const
export const isAvailableProcedure = (value: string | undefined): boolean => PROCEDURES.some((item) => item === value)

type Control = { days: number; label: string } | { months: number; label: string }
const FOLLOW_UPS: Record<string, Control[]> = {
  Botox: [{ days: 7, label: '7 días' }],
  'Hidroxiapatita de calcio': [{ days: 7, label: '7 días' }, { days: 30, label: '30 días' }],
  Hilos: [{ days: 2, label: '2 días' }, { months: 1, label: '1 mes' }],
  Blefaroplastia: [{ days: 2, label: '2 días' }, { days: 7, label: '7 días' }],
}

export function getFollowUpNotifications(appointments: Appointment[], clients: Client[], day: string): Notification[] {
  return appointments.flatMap((appointment) => {
    if (appointment.status !== 'scheduled' && appointment.status !== 'completed') return []
    const client = clients.find((item) => item.id === appointment.clientId)
    if (!client || !appointment.procedure) return []
    return (FOLLOW_UPS[appointment.procedure.trim()] ?? []).flatMap((control, index) => {
      const base = parseISO(appointment.date)
      const due = 'days' in control ? addDays(base, control.days) : addMonths(base, control.months)
      const date = format(due, 'yyyy-MM-dd')
      if (date > day) return []
      return [{
        id: 'followup-' + appointment.id + '-' + index,
        type: 'followUp' as const,
        title: 'Control de ' + appointment.procedure + ' · ' + control.label,
        subtitle: 'Recordatorio para el ' + format(due, 'dd/MM/yyyy') + ' · Turno del ' + format(base, 'dd/MM/yyyy'),
        clientId: client.id,
        clientName: (client.firstName + ' ' + client.lastName).trim(),
        date, color: 'blue',
      }]
    })
  }).sort((a, b) => a.date.localeCompare(b.date))
}
