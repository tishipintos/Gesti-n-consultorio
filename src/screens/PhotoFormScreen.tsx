import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera, Image as ImageIcon } from 'lucide-react'
import { useStore } from '../store'
import { Header } from '../components/Header'
import { Card } from '../components/Card'
import { Avatar } from '../components/Avatar'
import { getClientFullName, PHOTO_TYPE_LABELS, hapticFeedback } from '../utils'

export function PhotoFormScreen({ toast }: { toast: (args: { type: 'success' | 'error' | 'info'; message: string }) => void }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { getClient, addPhoto } = useStore()
  const client = getClient(id || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    type: 'before' as 'before' | 'after',
    procedure: '',
    notes: '',
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  if (!client) {
    return (
      <div className="min-h-screen bg-bg">
        <Header title="Paciente no encontrado" showBack />
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary">El paciente no existe</p>
        </div>
      </div>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({ type: 'error', message: 'La imagen no puede superar 5MB' })
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    hapticFeedback()

    if (!preview) {
      toast({ type: 'error', message: 'Seleccioná una imagen' })
      return
    }

    setSubmitted(true)

    addPhoto({
      clientId: client.id,
      fileUrl: preview,
      type: form.type,
      procedure: form.procedure.trim() || undefined,
      notes: form.notes.trim() || undefined,
      takenAt: new Date().toISOString(),
    })

    toast({ type: 'success', message: 'Foto subida' })
    navigate(-1)
  }

  const inputClass =
    'w-full bg-card rounded-xl px-4 fluid-sm text-text-primary placeholder:text-text-secondary border border-gray-100 focus:border-primary/30 transition-colors'

  return (
    <div className="app-page readable-screen bg-bg flex flex-col">
      <Header title="Nueva foto" showBack />

      <div className="form-center app-content w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="animate-slide-up stagger-1 opacity-0">
            <div className="flex items-center gap-3">
              <Avatar firstName={client.firstName} lastName={client.lastName} id={client.id} />
              <div>
                <p className="text-base font-semibold text-text-primary">
                  {getClientFullName(client)}
                </p>
                <p className="text-sm text-text-secondary">Paciente</p>
              </div>
            </div>
          </Card>

          <Card className="animate-slide-up stagger-2 opacity-0">
            <label className="fluid-xs font-medium text-text-secondary mb-2.5 block" id="photo-type-label">Tipo de foto</label>
            <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="photo-type-label">
              {(['before', 'after'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={form.type === type}
                  onClick={() => {
                    hapticFeedback()
                    setForm({ ...form, type })
                  }}
                  className="photo-type-button flex items-center justify-center rounded-xl min-h-12 font-semibold text-center"
                >
                  {PHOTO_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </Card>

          <Card className="animate-slide-up stagger-3 opacity-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Seleccionar foto"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 hover:border-primary/30 transition-colors press-scale overflow-hidden"
              aria-label={preview ? 'Cambiar foto seleccionada' : 'Tomar foto o elegir de galería'}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="flex gap-3">
                    <Camera size={30} className="text-text-secondary" />
                    <ImageIcon size={24} className="text-text-secondary" />
                  </div>
                  <span className="fluid-xs text-text-secondary">Tomar foto o elegir de galería</span>
                </>
              )}
            </button>
          </Card>

          <Card className="animate-slide-up stagger-4 opacity-0">
            <div className="space-y-4">
              <div>
                <label htmlFor="photo-procedure" className="fluid-xs font-medium text-text-secondary mb-1.5 block">Tratamiento</label>
                <input
                  id="photo-procedure"
                  type="text"
                  value={form.procedure}
                  onChange={(e) => setForm({ ...form, procedure: e.target.value })}
                  placeholder="Ej: Limpieza facial"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="photo-notes" className="fluid-xs font-medium text-text-secondary mb-1.5 block">Notas</label>
                <textarea
                  id="photo-notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notas adicionales..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </Card>

          <button
            type="submit"
            disabled={submitted || !preview}
            className="w-full bg-primary text-white rounded-xl fluid-sm font-semibold press-scale transition-all disabled:opacity-50 animate-slide-up stagger-5 opacity-0"
            style={{ height: 'var(--btn-h)' }}
          >
            {submitted ? 'Guardando...' : 'Guardar foto'}
          </button>
        </form>
      </div>
    </div>
  )
}
