import { useState, useEffect } from 'react'
import { Calendar, Users, Bell, ChevronRight } from 'lucide-react'
import { hapticFeedback } from '../utils'

const STORAGE_KEY = 'clinic_welcome_seen'

export function WelcomeOverlay({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) {
      const timer = setTimeout(() => setVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    hapticFeedback()
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
    onComplete()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={handleDismiss} />
      <div className="welcome-panel relative w-full max-w-sm bg-card rounded-2xl p-6 shadow-2xl animate-scale-in" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
        <div className="mb-6">
          <div className="text-primary mb-4">
            <Calendar size={32} className="text-primary" />
          </div>
          <h2 id="welcome-title" className="text-2xl font-semibold text-text-primary mb-3 tracking-tight">Bienvenido a Gestión Consultorio</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Administrá los turnos, pacientes y fotos de tu consultorio en un solo lugar.
          </p>
        </div>

        <div className="welcome-features mb-6">
          <div className="flex items-center gap-4 py-3">
            <div className="text-primary flex-shrink-0">
              <Calendar size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Calendario</p>
              <p className="text-xs text-text-secondary">Visualizá y agendá turnos</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3">
            <div className="text-primary flex-shrink-0">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Pacientes</p>
              <p className="text-xs text-text-secondary">Cargá datos y fotos</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3">
            <div className="text-primary flex-shrink-0">
              <Bell size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Alertas</p>
              <p className="text-xs text-text-secondary">Seguimiento automático</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-semibold press-scale flex items-center justify-center gap-2"
        >
          Empezar
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
