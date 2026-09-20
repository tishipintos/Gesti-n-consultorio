import { getFollowUpNotifications } from '../utils/procedures'
import { getPaymentNotifications } from '../utils/payments'
import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store'
import { getClientFullName, formatDate } from '../utils'
import { addDays } from 'date-fns'
import { onForeground } from '../platform/foreground'
import type { Notification } from '../types'

export function useNotifications() {
  const clients = useStore((state) => state.clients)
  const appointments = useStore((state) => state.appointments)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const refresh = () => setNow(Date.now())
    const timer = setInterval(refresh, 60000)
    const unsubscribe = onForeground(refresh)
    return () => { clearInterval(timer); unsubscribe() }
  }, [])
  const notifications = useMemo((): Notification[] => {
    const day = formatDate(new Date(now), 'yyyy-MM-dd')
    const tomorrow = formatDate(addDays(new Date(now), 1), 'yyyy-MM-dd')

    const result: Notification[] = []

    const upcomingAppointments = appointments.filter(
      (a) => a.status === 'scheduled' && (a.date === day || a.date === tomorrow)
    ).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

    upcomingAppointments.forEach((apt) => {
      const client = clients.find((c) => c.id === apt.clientId)
      if (!client) return

      const hasProcedure = Boolean(apt.procedure)

      result.push({
        id: apt.id,
        type: hasProcedure ? 'nextTreatment' : 'nextConsult',
        title: hasProcedure ? (apt.procedure ?? 'Próximo tratamiento') : 'Próxima consulta',
        subtitle: `${formatDate(apt.date, "dd 'de' MMMM")} a las ${apt.time}`,
        clientId: client.id,
        clientName: getClientFullName(client),
        date: apt.date,
        color: hasProcedure ? 'teal' : 'blue',
      })
    })

    result.push(...getFollowUpNotifications(appointments, clients, day))
    result.push(...getPaymentNotifications(appointments, clients, now))

    return result
  }, [clients, appointments, now])

  return notifications
}
