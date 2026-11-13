import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera, Image as ImageIcon, X } from 'lucide-react'
import { useStore } from '../store'
import { Header } from '../components/Header'
import { Card } from '../components/Card'
import { Avatar } from '../components/Avatar'
import { getClientFullName, PHOTO_TYPE_LABELS, hapticFeedback } from '../utils'

export function PhotoFormScreen({ toast }: { toast: (args: { type: 'success' | 'error' | 'info'; message: string }) => void }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { getClient, addPhotos } = useStore()
  const client = getClient(id || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const processing = useRef(false)

  const [form, setForm] = useState({
    type: 'before' as 'before' | 'after',
    procedure: '',
    notes: '',
  })
  const [previews, setPreviews] = useState<string[]>([])
  const [reading, setReading] = useState(false)
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length || processing.current) return
    if (files.some(file => file.size > 5 * 1024 * 1024)) {
      toast({ type: 'error', message: 'Cada imagen debe pesar como máximo 5 MB.' })
      return
    }
    if (files.some(file => file.type && !file.type.startsWith('image/'))) {
      toast({ type: 'error', message: 'Seleccioná únicamente imágenes.' })
      return
    }
    processing.current = true
    setReading(true)
    try {
      const images = await Promise.all(files.map(file => new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Imagen ilegible'))
        reader.onerror = () => reject(reader.error)
        reader.onabort = () => reject(new Error('Lectura cancelada'))
        reader.readAsDataURL(file)
      })))
      setPreviews(current => [...new Set([...current, ...images])])
    } catch {
      toast({ type: 'error', message: 'No se pudieron leer las fotos. Intentá seleccionarlas nuevamente.' })
    } finally {
      processing.current = false
      setReading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (processing.current) return
    hapticFeedback()

    if (!previews.length) {
      toast({ type: 'error', message: 'Seleccioná al menos una imagen' })
      return
    }

    processing.current = true
    setSubmitted(true)
    try {
      const takenAt = new Date().toISOString()
      addPhotos(previews.map(fileUrl => ({
        clientId: client.id,
        fileUrl,
        type: form.type,
        procedure: form.procedure.trim() || undefined,
        notes: form.notes.trim() || undefined,
        takenAt,
      })))
    } catch {
      toast({ type: 'error', message: 'No se pudieron guardar las fotos. Revisá el espacio disponible e intentá nuevamente.' })
      return
    } finally {
      processing.current = false
      setSubmitted(false)
    }
    toast({ type: 'success', message: previews.length === 1 ? 'Foto guardada' : `${previews.length} fotos guardadas` })
    navigate(-1)
  }

  const inputClass =
    'w-full bg-card rounded-xl px-4 fluid-sm text-text-primary placeholder:text-text-secondary border border-gray-100 focus:border-primary/30 transition-colors'

  return (
    <div className="app-page readable-screen bg-bg flex flex-col">
      <Header title="Agregar fotos" showBack />

      <div className="form-center app-content w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
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

          <Card>
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

          <Card>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              disabled={reading || submitted}
              onChange={handleFileChange}
              className="hidden"
              aria-label="Seleccionar fotos"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              disabled={reading || submitted}
              onChange={handleFileChange}
              className="hidden"
              aria-label="Tomar foto"
            />
            <div className="flex flex-wrap gap-3">
              <button
              type="button"
              disabled={reading || submitted}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 min-h-12 px-3 text-sm"
              ><ImageIcon size={20} aria-hidden="true" />{previews.length ? 'Agregar más' : 'Elegir fotos'}</button>
              <button type="button" disabled={reading || submitted} onClick={() => cameraInputRef.current?.click()} className="flex flex-1 items-center justify-center gap-2 min-h-12 px-3 text-sm"><Camera size={20} aria-hidden="true" />Tomar foto</button>
            </div>
            <p role="status" className="text-sm text-text-secondary mt-3">{reading ? 'Leyendo fotos…' : `${previews.length} ${previews.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}. Máximo 5 MB por foto.`}</p>
            {previews.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {previews.map((preview, index) => <div key={preview} className="relative">
                <img src={preview} alt={`Foto seleccionada ${index + 1}`} className="w-full aspect-square rounded-xl object-cover" />
                <button type="button" disabled={reading || submitted} onClick={() => setPreviews(current => current.filter(url => url !== preview))} aria-label={`Quitar foto ${index + 1}`} className="absolute top-1 right-1 w-11 h-11 flex items-center justify-center bg-card rounded-lg"><X size={20} aria-hidden="true" /></button>
              </div>)}
            </div>}
            <p className="text-sm text-text-secondary mt-3">El tipo, tratamiento y notas se aplican a todas las fotos seleccionadas.</p>
          </Card>

          <Card>
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
            disabled={submitted || reading || !previews.length}
            className="w-full bg-primary text-white rounded-xl fluid-sm font-semibold press-scale transition-all disabled:opacity-50"
            style={{ height: 'var(--btn-h)' }}
          >
            {submitted ? 'Guardando...' : previews.length > 1 ? `Guardar ${previews.length} fotos` : 'Guardar foto'}
          </button>
        </form>
      </div>
    </div>
  )
}
