import { useState } from 'react'
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Camera, Trash2, X } from 'lucide-react-native'
import { useStore } from '../store'
import { formatDate, PHOTO_TYPE_LABELS } from '../utils'
import { colors, fonts, styles } from './theme'
import { photoUri, removePhotoFile } from './photoFiles'
import { IconButton } from './chrome'
import { Button } from './ui'
import { confirmDelete } from './actions'
import type { PhotoType } from '../types'

export function PatientGallery({ clientId, onAdd, onCompare }: { clientId: string; onAdd: () => void; onCompare: () => void }) {
  const photos = useStore(s => s.photos).filter(p => p.clientId === clientId)
  const remove = useStore(s => s.deletePhoto)
  const [type, setType] = useState<PhotoType>('before')
  const [viewingId, setViewingId] = useState<string | null>(null)
  const viewing = photos.find(p => p.id === viewingId)
  const visible = photos.filter(p => p.type === type).sort((a, b) => b.takenAt.localeCompare(a.takenAt))
  const types: PhotoType[] = photos.some(p => p.type === 'progress') ? ['before', 'after', 'progress'] : ['before', 'after']
  return <View style={{ gap: 16 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}><Text style={[styles.heading, { flex: 1 }]}>Galería del paciente</Text><Text style={styles.muted}>{photos.length} fotos</Text></View>
    <View style={{ flexDirection: 'row', gap: 12 }}>{types.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: type === value }} onPress={() => setType(value)} style={[styles.button, { flex: 1, paddingHorizontal: 6, backgroundColor: type === value ? colors.soft : colors.surface, borderWidth: 1, borderColor: type === value ? colors.primary : colors.border }]}><Text style={[styles.buttonText, { color: colors.text }]}>{PHOTO_TYPE_LABELS[value]} ({photos.filter(p => p.type === value).length})</Text></Pressable>)}</View>
    {visible.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{visible.map(photo => <View key={photo.id} style={{ width: '48%', gap: 4 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Ampliar foto ${PHOTO_TYPE_LABELS[photo.type]} del ${formatDate(photo.takenAt)}`} onPress={() => setViewingId(photo.id)}><Image source={{ uri: photoUri(photo.fileUrl) }} style={styles.photo} accessibilityLabel={photo.procedure || PHOTO_TYPE_LABELS[photo.type]} /></Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={[styles.muted, { fontSize: 12 }]}>{formatDate(photo.takenAt)}</Text><IconButton icon={Trash2} color={colors.muted} label="Eliminar foto" onPress={() => confirmDelete('Se eliminará esta foto de la ficha.', () => { remove(photo.id); removePhotoFile(photo.fileUrl) })} /></View>
      {!!photo.procedure && <Text style={styles.muted}>{photo.procedure}</Text>}
    </View>)}</View> : <View style={{ alignItems: 'center', paddingVertical: 24, gap: 12 }}><Camera size={32} color={colors.primary} /><Text style={{ fontFamily: fonts.semibold, color: colors.text, fontSize: 16, textAlign: 'center' }}>Todavía no hay fotos de {PHOTO_TYPE_LABELS[type].toLowerCase()}</Text><Text style={[styles.muted, { textAlign: 'center' }]}>Agregá fotos para registrar la evolución del tratamiento.</Text><Button title="Agregar foto" onPress={onAdd} /></View>}
    {photos.length > 0 && <Button secondary title="Comparar fotos" onPress={onCompare} />}
    <Modal visible={!!viewing} animationType="fade" onRequestClose={() => setViewingId(null)}>
      <SafeAreaView style={[styles.page, { backgroundColor: '#16140F' }]}>
        <View style={{ flexDirection: 'row', padding: 16, justifyContent: 'space-between', alignItems: 'center' }}><Text style={[styles.text, { color: 'white', flex: 1 }]}>{viewing && `${PHOTO_TYPE_LABELS[viewing.type]} · ${formatDate(viewing.takenAt)}`}</Text><IconButton icon={X} label="Cerrar foto" color="white" onPress={() => setViewingId(null)} /></View>
        {viewing && <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }} maximumZoomScale={3} minimumZoomScale={1}><Image source={{ uri: photoUri(viewing.fileUrl) }} resizeMode="contain" style={{ width: '100%', minHeight: 400, flex: 1 }} accessibilityLabel={viewing.procedure || 'Foto ampliada'} /><Text style={[styles.text, { color: 'white', marginTop: 16 }]}>{viewing.procedure}</Text><Text style={[styles.muted, { color: '#E4DED1' }]}>{viewing.notes}</Text></ScrollView>}
      </SafeAreaView>
    </Modal>
  </View>
}
