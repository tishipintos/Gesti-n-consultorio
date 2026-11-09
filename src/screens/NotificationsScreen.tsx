import { notificationDisplay } from '../utils/notificationDisplay'
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Calendar, Stethoscope, Clock, DollarSign } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { notificationKey, useNotificationReadState } from '../store/notificationReadState'
import { formatDate } from '../utils'
import { addDays } from 'date-fns'
import { Header } from '../components/Header'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import type { Notification } from '../types'

export function NotificationsScreen() {
  const navigate = useNavigate()

  const notifications = useNotifications()
  const markSeen = useNotificationReadState((state) => state.markSeen)
  useEffect(() => { markSeen(notifications.map(notificationKey)) }, [notifications, markSeen])

  const grouped = useMemo(() => {
    const today: Notification[] = []
    const tomorrow: Notification[] = []
    const followUp: Notification[] = []
    const paymentDue: Notification[] = []

    const now = new Date()
    const todayDate = formatDate(now, 'yyyy-MM-dd')
    const tomorrowDate = formatDate(addDays(now, 1), 'yyyy-MM-dd')

    notifications.forEach((n) => {
      if (n.type === 'paymentDue') {
        paymentDue.push(n)
      } else if (n.type === 'followUp') {
        followUp.push(n)
      } else {
        if (n.date === todayDate) {
          today.push(n)
        } else if (n.date === tomorrowDate) {
          tomorrow.push(n)
        }
      }
    })

    return { today, tomorrow, followUp, paymentDue }
  }, [notifications])

  const sections = [
    { key: 'payment', title: 'PAGOS PENDIENTES', items: grouped.paymentDue, icon: DollarSign, color: 'text-error' },
    { key: 'today', title: 'HOY', items: grouped.today, icon: Clock, color: 'text-info' },
    { key: 'tomorrow', title: 'MAÑANA', items: grouped.tomorrow, icon: Calendar, color: 'text-secondary' },
    { key: 'followUp', title: 'SEGUIMIENTO', items: grouped.followUp, icon: Stethoscope, color: 'text-warning' },
  ].filter((s) => s.items.length > 0)

  return (
    <div className="app-page readable-screen bg-bg flex flex-col">
      <Header
        title="Notificaciones"
        subtitle={notifications.length > 0 ? `${notifications.length} activas` : undefined}
      />

      <main className="app-content flex-1 flex flex-col" style={{ justifyContent: notifications.length === 0 ? 'center' : 'flex-start' }}>
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={48} />}
            title="Sin notificaciones"
            description="Las notificaciones se generan automáticamente según los turnos y pacientes"
          />
        ) : (
          <div className="app-stack notification-layout">
            {sections.map(section => (
              <div key={section.key} className="min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <section.icon size={14} className={section.color} aria-hidden="true" />
                  <h2 className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
                    {section.title}
                  </h2>
                </div>
                <div className="flex flex-col gap-2" aria-label={section.title}>
                  {section.items.map(notification => {
                    const display = notificationDisplay(notification)
                    const Icon = notification.type === 'nextTreatment' ? Stethoscope : section.icon
                    return <Card key={notification.id} onClick={() => navigate(`/clients/${notification.clientId}`)} className="notification-card" padding={false}>
                      <div className="flex items-center gap-3">
                        <Icon size={20} color={display.color} className="shrink-0" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="font-extrabold leading-tight text-text-primary break-words">{display.title}</p>
                          <p className="text-sm text-text-secondary break-words">{display.description}</p>
                        </div>
                      </div>
                    </Card>
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
