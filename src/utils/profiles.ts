import type { Appointment, Client, Profile } from '../types'
import { formatDate } from './index'
import { getFollowUpNotifications } from './procedures'

export const profileOptions = [
  { value: 'coti', label: 'Coti' },
  { value: 'pitu', label: 'Pitu' },
] as const

export const profileSections = {
  history: { path: 'historial', title: 'Historial de consultas', empty: 'Sin consultas pasadas.' },
  future: { path: 'futuras', title: 'Futuras consultas', empty: 'Sin consultas futuras.' },
  followUps: { path: 'seguimientos', title: 'Seguimientos', empty: 'Sin seguimientos próximos.' },
} as const

export type ProfileSection = keyof typeof profileSections

export const attendingOptions = [{ value: '', label: 'Sin asignar' }, ...profileOptions]
export const parseProfile = (value: string) => profileOptions.find(option => option.value === value)?.value
export const profileName = (profile?: Profile) => profileOptions.find(option => option.value === profile)?.label ?? 'Sin registrar'

export function appointmentAttribution(appointment: Appointment) {
  return 'Agendada por: ' + profileName(appointment.scheduledBy) + ' · Atendida por: ' + (appointment.attendedBy ? profileName(appointment.attendedBy) : appointment.scheduledBy ? 'Sin asignar' : 'Sin registrar')
}

export function getProfileSections(profile: Profile, appointments: Appointment[], clients: Client[], now: Date) {
  const time = (a: Appointment) => new Date(a.date + 'T' + a.time).getTime()
  const assigned = appointments.filter(a => a.attendedBy === profile)
  return {
    history: assigned.filter(a => time(a) < now.getTime()).sort((a, b) => time(b) - time(a)),
    future: assigned.filter(a => a.status === 'scheduled' && time(a) >= now.getTime()).sort((a, b) => time(a) - time(b)),
    followUps: getFollowUpNotifications(
      assigned.filter(a => a.status === 'completed' || time(a) < now.getTime()),
      clients, formatDate(now, 'yyyy-MM-dd'), 'upcoming',
    ),
  }
}
