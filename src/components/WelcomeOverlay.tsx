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
      <div className="relative w-full max-w-sm bg-card rounded-3xl p-8 shadow-2xl animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Bienvenido a Gestión Consultorio</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Administrá los turnos, pacientes y fotos de tu consultorio en un solo lugar.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Calendario</p>
              <p className="text-xs text-text-secondary">Visualizá y agendá turnos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Pacientes</p>
              <p className="text-xs text-text-secondary">Cargá datos y fotos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
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
