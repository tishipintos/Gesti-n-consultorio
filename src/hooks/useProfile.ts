import { useEffect, useState } from 'react'
import { onForeground } from '../platform/foreground'
import { useStore } from '../store'
import { getProfileSections } from '../utils/profiles'

export function useProfile() {
  const { activeProfile, appointments, clients } = useStore()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const refresh = () => setNow(new Date())
    const timer = setInterval(refresh, 60000)
    const unsubscribe = onForeground(refresh)
    return () => { clearInterval(timer); unsubscribe() }
  }, [])
  const { history, future, followUps } = getProfileSections(activeProfile, appointments, clients, now)
  return { clients, history, future, followUps }
}
