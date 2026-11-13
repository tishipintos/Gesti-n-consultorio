import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useStore } from '../store'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { useProfile } from '../hooks/useProfile'
import { formatDate, getClientFullName } from '../utils'
import { appointmentAttribution, profileName, profileOptions, profileSections } from '../utils/profiles'
import type { Profile } from '../types'
import type { ProfileSection } from '../utils/profiles'

export function ProfileScreen() {
  const activeProfile = useStore(s => s.activeProfile)
  const setActiveProfile = useStore(s => s.setActiveProfile)
  const [error, setError] = useState(false)
  const select = (profile: Profile) => {
    try { setActiveProfile(profile); setError(false) } catch { setError(true) }
  }
  return <div className="app-page bg-bg">
    <Header title="Perfil" />
    <main className="app-content app-stack">
      <section className="profile-summary">
        <h2 className="text-xl font-bold">{profileName(activeProfile)}</h2>
        <fieldset className="flex flex-wrap gap-2 mt-2">
          <legend className="text-sm text-text-secondary mb-2">Cambiar perfil</legend>
          {profileOptions.map(({ value, label }) => <button type="button" key={value} onClick={() => select(value)} aria-pressed={value === activeProfile} className={'min-h-11 px-4 rounded-xl font-semibold ' + (value === activeProfile ? 'bg-primary text-white' : 'bg-primary/10 text-text-primary')}>{label}</button>)}
        </fieldset>
        {error && <p role="alert" className="mt-2 text-error">No se pudo guardar el perfil.</p>}
      </section>
      <div className="app-list profile-settings">
        {Object.values(profileSections).map(section => <Link key={section.path} to={'/profile/' + section.path} className="profile-record flex min-h-12 items-center justify-between gap-3 rounded-xl bg-card p-4 font-bold">
          {section.title}<ChevronRight size={20} className="shrink-0 text-primary" aria-hidden="true" />
        </Link>)}
      </div>
    </main>
  </div>
}

export function ProfileSectionScreen({ section }: { section: ProfileSection }) {
  const { title, empty } = profileSections[section]
  const lists = useProfile()
  const items = section === 'followUps' ? lists.followUps.map(item => ({
    id: item.id,
    to: '/clients/' + item.clientId,
    title: item.clientName,
    detail: item.title,
    caption: formatDate(item.date),
  })) : lists[section].flatMap(item => {
    const client = lists.clients.find(c => c.id === item.clientId)
    if (!client) return []
    return [{
      id: item.id,
      to: '/clients/' + item.clientId + '/appointments/' + item.id + '/edit',
      title: getClientFullName(client),
      detail: formatDate(item.date) + ' · ' + item.time + ' · ' + (item.procedure || 'Consulta'),
      caption: appointmentAttribution(item),
    }]
  })

  return <div className="app-page bg-bg">
    <Header title={title} backTo="/profile" />
    <main className="app-content app-list">
      {!items.length && <p className="text-text-secondary">{empty}</p>}
      {items.map(item => <Link key={item.id} className="block profile-record rounded-xl bg-card p-3 break-words" to={item.to}>
        <p className="font-bold">{item.title}</p>
        <p>{item.detail}</p>
        <p className="text-sm text-text-secondary">{item.caption}</p>
      </Link>)}
    </main>
  </div>
}
