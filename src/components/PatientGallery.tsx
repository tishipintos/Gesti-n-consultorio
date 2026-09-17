import { useEffect, useRef, useState } from 'react'
import { Camera, Trash2, X } from 'lucide-react'
import type { ClientPhoto } from '../types'
import { formatDate, PHOTO_TYPE_LABELS } from '../utils'

function PhotoViewer({ photo, onClose }: { photo: ClientPhoto; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    const previous = document.activeElement as HTMLElement | null
    dialog.showModal()
    return () => { dialog.close(); previous?.focus() }
  }, [])
  return (
    <dialog ref={ref} className="patient-photo-viewer flat-controls" aria-label="Foto del paciente ampliada" onCancel={(event) => { event.preventDefault(); onClose() }}>
      <div className="flex items-center justify-between gap-3 p-4">
        <p className="font-semibold">{PHOTO_TYPE_LABELS[photo.type]} ? {formatDate(photo.takenAt, 'dd/MM/yyyy')}</p>
        <button onClick={onClose} aria-label="Cerrar" className="w-11 h-11 flex items-center justify-center shrink-0"><X size={24} /></button>
      </div>
      <img src={photo.fileUrl} alt={photo.procedure || PHOTO_TYPE_LABELS[photo.type]} className="patient-photo-full" />
      {(photo.procedure || photo.notes) && <div className="p-4"><p className="font-semibold">{photo.procedure}</p><p className="whitespace-pre-wrap text-text-secondary">{photo.notes}</p></div>}
    </dialog>
  )
}

export function PatientGallery({ photos, onAdd, onDelete }: { photos: ClientPhoto[]; onAdd: () => void; onDelete: (id: string) => void }) {
  const [type, setType] = useState<'before' | 'after'>('before')
  const [viewingId, setViewingId] = useState<string | null>(null)
  const types = ['before', 'after'] as const
  const visible = photos.filter((photo) => photo.type === type).sort((a, b) => b.takenAt.localeCompare(a.takenAt))
  const viewing = photos.find((photo) => photo.id === viewingId)
  return (
    <section aria-labelledby="patient-gallery-title">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 id="patient-gallery-title" className="text-lg font-bold">Galería del paciente</h3>
        <span className="text-sm text-text-secondary">{photos.length} fotos</span>
      </div>
      <div className="flex gap-3 mb-4" role="group" aria-label="Tipo de fotos">
        {types.map((value) => <button key={value} type="button" aria-pressed={type === value} onClick={() => setType(value)} className="photo-type-button flex-1 min-h-12 px-2 rounded-xl text-center font-semibold">{PHOTO_TYPE_LABELS[value]} ({photos.filter((photo) => photo.type === value).length})</button>)}
      </div>
      {visible.length ? (
        <ul className="grid grid-cols-2 gap-3 flat-controls" aria-label={PHOTO_TYPE_LABELS[type]}>
          {visible.map((photo) => (
            <li key={photo.id} className="min-w-0">
              <button type="button" onClick={() => setViewingId(photo.id)} className="block w-full aspect-square rounded-xl overflow-hidden" aria-label={'Ampliar foto ' + PHOTO_TYPE_LABELS[photo.type] + ' del ' + formatDate(photo.takenAt, 'dd/MM/yyyy')}>
                <img loading="lazy" src={photo.fileUrl} alt={photo.procedure || PHOTO_TYPE_LABELS[photo.type]} className="w-full h-full object-cover" />
              </button>
              <div className="flex items-center justify-between gap-1 mt-1">
                <time dateTime={photo.takenAt} className="text-sm text-text-secondary">{formatDate(photo.takenAt, 'dd/MM/yyyy')}</time>
                <button type="button" onClick={() => onDelete(photo.id)} className="w-11 h-11 shrink-0 flex items-center justify-center text-text-secondary hover:text-error" aria-label={'Eliminar foto del ' + formatDate(photo.takenAt, 'dd/MM/yyyy')}><Trash2 size={18} /></button>
              </div>
              {photo.procedure && <p className="text-sm break-words">{photo.procedure}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-6 text-center">
          <Camera size={32} className="mx-auto mb-3 text-primary" aria-hidden="true" />
          <p className="font-semibold">Todavía no hay fotos de {PHOTO_TYPE_LABELS[type].toLowerCase()}</p>
          <p className="text-sm text-text-secondary mt-2 mb-4">Agrega fotos para registrar la evolución del tratamiento.</p>
          <button type="button" onClick={onAdd} className="bg-primary text-white min-h-12 px-5 font-semibold">Agregar foto</button>
        </div>
      )}
      {viewing && <PhotoViewer photo={viewing} onClose={() => setViewingId(null)} />}
    </section>
  )
}
