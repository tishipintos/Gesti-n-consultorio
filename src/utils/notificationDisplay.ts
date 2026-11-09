import type { Notification } from '../types'
import { formatDate } from './index'

export function notificationDisplay(item: Notification) {
  switch (item.type) {
    case 'paymentDue':
      return { title: 'Pago pendiente', description: item.clientName + ' · ' + formatDate(item.date, 'dd/MM'), color: '#BE123C' }
    case 'followUp':
      return { title: item.title, description: item.clientName + ' · ' + formatDate(item.date, 'dd/MM'), color: '#966010' }
    case 'nextTreatment':
      return { title: item.title, description: item.clientName + ' · ' + item.subtitle, color: '#0F766E' }
    case 'nextConsult':
      return { title: item.title, description: item.clientName + ' · ' + item.subtitle, color: '#245DA8' }
  }
}
