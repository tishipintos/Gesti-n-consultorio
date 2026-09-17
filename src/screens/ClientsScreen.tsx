import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { useStore } from '../store'
import { getClientFullName } from '../utils'
import { Header } from '../components/Header'
import { Card } from '../components/Card'
import { Avatar } from '../components/Avatar'
import { FAB } from '../components/FAB'
import { EmptyState } from '../components/EmptyState'
import { Skeleton } from '../components/Skeleton'

const alphabet = [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ', '#']
const collator = new Intl.Collator('es', { sensitivity: 'base' })
const initial = (name: string) => {
  const first = name.trim().toLocaleUpperCase('es').charAt(0)
  const letter = first === 'Ñ' ? first : first.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return alphabet.includes(letter) ? letter : '#'
}

export function ClientsScreen() {
  const navigate = useNavigate()
  const { clients } = useStore()
  const [search, setSearch] = useState('')
  const [scrollLetter, setScrollLetter] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>
    let frame = 0
    const onScroll = () => {
      clearTimeout(hideTimer)
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0
        const headings = Array.from(document.querySelectorAll<HTMLElement>('.client-letter-heading'))
        const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
        const anchor = headerBottom + (window.innerHeight - headerBottom) / 3
        let current = headings[0]
        for (const heading of headings) {
          if (heading.getBoundingClientRect().top <= anchor) current = heading
          else break
        }
        setScrollLetter(current?.textContent ?? null)
      })
      hideTimer = setTimeout(() => setScrollLetter(null), 700)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(hideTimer)
      cancelAnimationFrame(frame)
    }
  }, [])

  const filteredClients = useMemo(() => {
    const sorted = [...clients].sort((a, b) => collator.compare(getClientFullName(a), getClientFullName(b)))
    if (!search.trim()) return sorted
    const q = search.trim().toLowerCase()
    return sorted.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    )
  }, [clients, search])

  const groups = alphabet.map((letter) => ({
    letter,
    clients: filteredClients.filter((client) => initial(client.firstName) === letter),
  })).filter((group) => group.clients.length > 0)

  return (
    <div className="app-page bg-bg flex flex-col">
      <Header
        title="Pacientes"
        subtitle={`${clients.length} total`}
      />

      <main
        className="flex-1"
        style={{ width: '100%', maxWidth: '32rem', marginInline: 'auto', padding: '1.25rem 1rem 0' }}
      >
        <div className="client-search surface" style={{ width: '100%', marginBottom: '1.25rem' }}>
          <Search size={22} aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setScrollLetter(null) }}
            aria-label="Buscar pacientes por nombre, teléfono o email"
            className="text-text-primary"
          />
        </div>

        {isLoading ? (
          <div className="app-list">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <div className="flex items-center gap-3">
                  <Skeleton variant="circle" className="w-12 h-12" />
                  <div className="flex-1">
                    <Skeleton variant="text" className="w-32 mb-2" />
                    <Skeleton variant="text" className="w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center">
            <EmptyState
              icon={<Users size={48} />}
              title={search ? 'Sin resultados' : 'Sin pacientes'}
              description={
                search
                  ? 'No se encontraron pacientes con esos datos'
                  : 'Agregá tu primer paciente para comenzar'
              }
              action={
                !search
                  ? {
                      label: 'Agregar paciente',
                      onClick: () => navigate('/clients/new'),
                    }
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="client-directory">
            <div className="min-w-0 space-y-5">
              {groups.map((group) => (
                <section key={group.letter} aria-labelledby={'client-letter-' + group.letter}>
                  <h2 id={'client-letter-' + group.letter} tabIndex={-1} className="client-letter-heading text-sm font-semibold text-text-secondary mb-2">{group.letter}</h2>
                  <div className="app-list">
            {group.clients.map((client) => (
              <Card
                key={client.id}
                onClick={() => navigate(`/clients/${client.id}`)}

              >
                <div className="flex items-center gap-3">
                  <Avatar
                    firstName={client.firstName}
                    lastName={client.lastName}
                    id={client.id}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-text-primary truncate">
                      {getClientFullName(client)}
                    </p>
                    {client.phone && (
                      <p className="text-sm text-text-secondary truncate">{client.phone}</p>
                    )}
                    {client.email && !client.phone && (
                      <p className="text-sm text-text-secondary truncate">{client.email}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
                  </div>
                </section>
              ))}
            </div>

          </div>
        )}
      </main>

      {scrollLetter && !isLoading && filteredClients.length > 0 && (
        <div className="client-scroll-letter" aria-hidden="true">{scrollLetter}</div>
      )}
      <FAB onClick={() => navigate('/clients/new')} label="Paciente" />
    </div>
  )
}
