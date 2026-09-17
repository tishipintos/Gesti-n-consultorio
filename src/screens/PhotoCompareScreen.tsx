import { useState, useMemo, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Trash2, Camera } from 'lucide-react'
import { useStore } from '../store'
import { Header } from '../components/Header'
import { Card } from '../components/Card'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import {
  getClientFullName,
  formatDate,
  PHOTO_TYPE_LABELS,
  PHOTO_TYPE_COLORS,
  hapticFeedback,
} from '../utils'

type ViewMode = 'single' | 'sideBySide' | 'slider'

export function PhotoCompareScreen() {
  const { id } = useParams<{ id: string }>()
  const { getClient, getPhotosForClient, deletePhoto } = useStore()
  const client = getClient(id || '')
  const photos = useMemo(() => getPhotosForClient(id || ''), [id, getPhotosForClient])

  const [viewMode, setViewMode] = useState<ViewMode>('sideBySide')
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  const beforePhotos = photos.filter((p) => p.type === 'before')
  const afterPhotos = photos.filter((p) => p.type === 'after')

  const handleSliderMove = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return
      const rect = sliderRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
      setSliderPosition(percentage)
    },
    []
  )

  const handleSliderTouch = useCallback(
    (e: React.TouchEvent) => {
      handleSliderMove(e.touches[0].clientX)
    },
    [handleSliderMove]
  )

  const handleSliderMouse = useCallback(
    (e: React.MouseEvent) => {
      if (e.buttons === 1) {
        handleSliderMove(e.clientX)
      }
    },
    [handleSliderMove]
  )

  const handleSliderKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setSliderPosition((prev) => Math.max(0, prev - 2))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setSliderPosition((prev) => Math.min(100, prev + 2))
      }
    },
    []
  )

  const handleDelete = (photoId: string) => {
    hapticFeedback()
    const deletedIndex = photos.findIndex((p) => p.id === photoId)
    deletePhoto(photoId)
    setConfirmDelete(null)
    if (deletedIndex !== -1 && deletedIndex <= selectedPhoto && selectedPhoto > 0) {
      setSelectedPhoto((prev) => prev - 1)
    }
  }

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

  const modes: { key: ViewMode; label: string }[] = [
    { key: 'single', label: 'Individual' },
    { key: 'sideBySide', label: 'Lado a lado' },
    { key: 'slider', label: 'Slider' },
  ]

  return (
    <div className="app-page bg-bg">
      <Header
        title="Comparar fotos"
        showBack
        subtitle={getClientFullName(client)}
      />

      <main className="app-content app-stack">
        <div className="flex gap-2 animate-slide-up stagger-1 opacity-0" role="group" aria-label="Modo de visualización">
          {modes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => {
                hapticFeedback()
                setViewMode(mode.key)
              }}
              aria-pressed={viewMode === mode.key}
              className={`flex-1 py-2 rounded-xl fluid-xs font-semibold transition-all press-scale ${
                viewMode === mode.key
                  ? 'bg-primary text-white'
                  : 'bg-card text-text-secondary border border-gray-100'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-text-secondary/60 text-center">
          {viewMode === 'single' && 'Visualizá una foto a la vez'}
          {viewMode === 'sideBySide' && 'Compará antes y después lado a lado'}
          {viewMode === 'slider' && 'Deslizá para revelar la diferencia'}
        </p>

        {photos.length === 0 ? (
          <div className="animate-slide-up stagger-2 opacity-0">
            <EmptyState
              icon={<Camera size={48} />}
              title="Sin fotos"
              description="No hay fotos para comparar. Subí fotos antes y después del tratamiento."
            />
          </div>
        ) : viewMode === 'single' ? (
          <div className="animate-slide-up stagger-2 opacity-0">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
              <img
                src={photos[selectedPhoto]?.fileUrl}
                alt="Foto"
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full ${PHOTO_TYPE_COLORS[photos[selectedPhoto]?.type]}`}
              >
                {PHOTO_TYPE_LABELS[photos[selectedPhoto]?.type]}
              </span>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
                  <p className="text-white text-xs font-medium">
                    {formatDate(photos[selectedPhoto]?.takenAt, "dd 'de' MMMM, yyyy")}
                  </p>
                  {photos[selectedPhoto]?.procedure && (
                    <p className="text-white/70 text-[10px]">{photos[selectedPhoto].procedure}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => {
                    hapticFeedback()
                    setSelectedPhoto(i)
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all press-scale ${
                    selectedPhoto === i ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={photo.fileUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : viewMode === 'sideBySide' ? (
          <div className="animate-slide-up stagger-2 opacity-0">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-center mb-2">
                  <span className="text-[10px] font-bold bg-before text-white px-2 py-0.5 rounded-full">
                    Antes
                  </span>
                </div>
                {beforePhotos.length > 0 ? (
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={beforePhotos[0].fileUrl}
                      alt="Antes"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center">
                    <p className="text-xs text-text-secondary">Sin foto</p>
                  </div>
                )}
              </div>
              <div>
                <div className="text-center mb-2">
                  <span className="text-[10px] font-bold bg-after text-white px-2 py-0.5 rounded-full">
                    Después
                  </span>
                </div>
                {afterPhotos.length > 0 ? (
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={afterPhotos[0].fileUrl}
                      alt="Después"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center">
                    <p className="text-xs text-text-secondary">Sin foto</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-slide-up stagger-2 opacity-0">
            {beforePhotos.length > 0 && afterPhotos.length > 0 ? (
              <div
                ref={sliderRef}
                className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-col-resize select-none"
                role="slider"
                aria-label="Comparar fotos antes y después"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(sliderPosition)}
                tabIndex={0}
                onKeyDown={handleSliderKeyDown}
                onTouchMove={handleSliderTouch}
                onMouseMove={handleSliderMouse}
              >
                <img
                  src={afterPhotos[0].fileUrl}
                  alt="Después"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={beforePhotos[0].fileUrl}
                    alt="Antes"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: `${100 / (sliderPosition / 100)}%`, maxWidth: 'none' }}
                  />
                </div>
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-primary rounded-full" aria-hidden="true" />
                  </div>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-bold bg-before text-white px-2 py-0.5 rounded-full">
                    Antes
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] font-bold bg-after text-white px-2 py-0.5 rounded-full">
                    Después
                  </span>
                </div>
              </div>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <p className="text-text-secondary fluid-sm">
                    Se necesitan fotos "Antes" y "Después" para usar el slider
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {photos.length > 0 && (
          <div className="animate-slide-up stagger-3 opacity-0">
            <h3 className="fluid-sm font-semibold text-text-secondary mb-2">Todas las fotos</h3>
            <div className="space-y-2">
              {photos.map((photo) => (
                <Card key={photo.id} padding={false} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={photo.fileUrl} alt={`Foto ${photo.type === 'before' ? 'antes' : photo.type === 'after' ? 'después' : 'progreso'} del ${formatDate(photo.takenAt, 'dd/MM/yyyy')}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`fluid-xs font-bold px-2 py-0.5 rounded-full ${PHOTO_TYPE_COLORS[photo.type]}`}>
                          {PHOTO_TYPE_LABELS[photo.type]}
                        </span>
                        <span className="fluid-xs text-text-secondary">
                          {formatDate(photo.takenAt, 'dd MMM yyyy')}
                        </span>
                      </div>
                      {photo.procedure && (
                        <p className="fluid-xs text-text-primary mt-0.5 truncate">{photo.procedure}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        hapticFeedback()
                        setConfirmDelete(photo.id)
                      }}
                      className="p-2.5 text-text-secondary/40 hover:text-error press-scale rounded-xl hover:bg-error/5"
                      aria-label="Eliminar foto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Eliminar foto"
        message="¿Estás seguro de que querés eliminar esta foto? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (confirmDelete) {
            handleDelete(confirmDelete)
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
