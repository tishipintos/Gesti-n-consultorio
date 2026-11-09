import { useLocation, useNavigate } from 'react-router-dom'
import { Calendar, Users, Bell, UserRound } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { notificationKey, useNotificationReadState } from '../store/notificationReadState'
import { hapticFeedback } from '../utils'

const tabs = [
  { path: '/calendar', label: 'Calendario', icon: Calendar },
  { path: '/clients', label: 'Pacientes', icon: Users },
  { path: '/notifications', label: 'Avisos', icon: Bell },
  { path: '/profile', label: 'Perfil', icon: UserRound },
]

export function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const notifications = useNotifications()
  const seen = useNotificationReadState((state) => state.seen)
  const seenKeys = new Set(seen)
  const hasUnread = notifications.some((notification) => !seenKeys.has(notificationKey(notification)))

  const isActive = (path: string) => {
    if (path === '/calendar') return location.pathname.startsWith('/calendar')
    if (path === '/clients') return location.pathname.startsWith('/clients')
    if (path === '/notifications') return location.pathname.startsWith('/notifications')
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className="app-navigation fixed z-50 flat-controls" aria-label="Navegación principal">
      <div className="tabbar-items flex items-center justify-around max-w-lg mx-auto" style={{ minHeight: 'var(--tabbar-h)' }}>
        {tabs.map((tab) => {
          const active = isActive(tab.path)
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              aria-current={active ? 'page' : undefined}
              aria-label={tab.path === '/notifications' ? (hasUnread ? 'Avisos de notificaciones sin abrir' : 'Avisos de notificaciones') : tab.label}
              onClick={() => {
                hapticFeedback()
                navigate(tab.path)
              }}
              className={`relative flex flex-col items-center justify-center gap-0.5 w-full py-1.5 tabbar-button rounded-full ${
                active ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <div className="relative">
                <Icon
                  size={24}
                  strokeWidth={active ? 2.2 : 1.5}
                  aria-hidden="true"
                />
                {tab.path === '/notifications' && hasUnread && (
                  <span aria-hidden="true" className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-card" />
                )}
              </div>
              <span className="text-xs font-semibold">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
