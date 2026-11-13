import { useRef, useState } from 'react'
import { ActionSheetIOS, Alert, Image, Platform, Pressable, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Directory, File, Paths } from 'expo-file-system'
import { Image as ImageIcon } from 'lucide-react-native'
import { useStore } from '../store'
import type { PhotoType } from '../types'
import { generateId, getClientFullName, PHOTO_TYPE_LABELS } from '../utils'
import type { ScreenProps } from './navigation'
import { Button, Empty, Field, Page } from './ui'
import { colors, styles } from './theme'
import { Avatar } from './chrome'
import { PHOTO_DIRECTORY, removePhotoFile } from './photoFiles'

export function PhotoFormScreen({ route, navigation }: ScreenProps<'PhotoForm'>) {
  const clientId = route.params.clientId
  const store = useStore()
  const [uris, setUris] = useState<string[]>([])
  const [type, setType] = useState<PhotoType>('before')
  const [procedure, setProcedure] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const sourceOpenRef = useRef(false)
  const pick = async (camera: boolean) => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    try {
      if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) { Alert.alert('Permiso de cámara', 'Permití el acceso a la cámara en los ajustes del celular o elegí una foto de la galería.'); return }
      const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsMultipleSelection: true })
      if (!result.canceled) setUris(previous => [...new Set([...previous, ...result.assets.map(asset => asset.uri)])])
    } catch { Alert.alert('No se pudo abrir la foto', 'Intentá nuevamente con la cámara o la galería.') }
    finally { busyRef.current = false; setBusy(false) }
  }
  const chooseSource = () => {
    if (busyRef.current || sourceOpenRef.current) return
    sourceOpenRef.current = true
    const select = (index: number) => { sourceOpenRef.current = false; if (index === 1 || index === 2) void pick(index === 1) }
    if (Platform.OS === 'ios') ActionSheetIOS.showActionSheetWithOptions({ options: ['Cancelar', 'Tomar foto', 'Elegir de galería'], cancelButtonIndex: 0 }, select)
    else Alert.alert('Seleccionar fotos', undefined, [{ text: 'Cancelar', style: 'cancel', onPress: () => select(0) }, { text: 'Tomar foto', onPress: () => select(1) }, { text: 'Elegir de galería', onPress: () => select(2) }], { onDismiss: () => { sourceOpenRef.current = false } })
  }
  const save = () => {
    if (busyRef.current || sourceOpenRef.current) return
    if (!uris.length) { Alert.alert('Faltan fotos', 'Tomá una foto o elegí fotos de la galería.'); return }
    busyRef.current = true
    setBusy(true)
    const copied: string[] = []
    try {
      const directory = new Directory(Paths.document, PHOTO_DIRECTORY)
      directory.create({ idempotent: true, intermediates: true })
      const takenAt = new Date().toISOString()
      const photos = uris.map(uri => {
        const extension = uri.split('?')[0].match(/\.(jpe?g|png|heic|webp)$/i)?.[1] || 'jpg'
        const name = `${generateId()}.${extension}`
        const fileUrl = `${PHOTO_DIRECTORY}/${name}`
        copied.push(fileUrl)
        new File(uri).copy(new File(directory, name))
        return { clientId, fileUrl, type, procedure: procedure.trim(), notes: notes.trim(), takenAt }
      })
      store.addPhotos(photos)
    } catch {
      copied.forEach(removePhotoFile)
      Alert.alert('No se pudo guardar', 'Verificá el espacio disponible e intentá nuevamente.')
      return
    } finally { busyRef.current = false; setBusy(false) }
    navigation.goBack()
  }
  const client = store.clients.find(c => c.id === clientId)
  if (!client) return <Page><Empty title="Paciente no encontrado" detail="Volvé a la lista de pacientes." /></Page>
  return <Page><View style={[styles.card, styles.row]}><Avatar {...client} /><View style={{ flex: 1 }}><Text style={styles.heading}>{getClientFullName(client)}</Text><Text style={styles.muted}>Paciente</Text></View></View>
    <View style={{ flexDirection: 'row', gap: 12 }}>{(['before', 'after'] as const).map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: type === value }} onPress={() => setType(value)} style={[styles.button, { flex: 1, backgroundColor: type === value ? colors.primary : colors.tint }]}><Text style={[styles.buttonText, type !== value && { color: colors.text }]}>{PHOTO_TYPE_LABELS[value]}</Text></Pressable>)}</View>
    <View style={styles.card}>
    {uris.length ? <><Text style={styles.muted}>{uris.length} {uris.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 }}>{uris.map((uri, index) => <View key={uri} style={{ width: '48%', gap: 4 }}><Image source={{ uri }} accessibilityLabel={`Vista previa de la foto ${index + 1}`} style={styles.photo} resizeMode="contain" /><Button secondary title={`Quitar foto ${index + 1}`} disabled={busy} onPress={() => { if (!busyRef.current) setUris(previous => previous.filter(value => value !== uri)) }} /></View>)}</View><Button secondary title="Agregar más fotos o tomar una foto" disabled={busy} onPress={chooseSource} /><Text style={styles.muted}>La etapa, el procedimiento y las notas se aplican a todas las fotos seleccionadas.</Text></> : <Pressable accessibilityRole="button" accessibilityLabel="Seleccionar fotos para registrar la evolución" accessibilityState={{ disabled: busy }} disabled={busy} onPress={chooseSource}><View style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 12, padding: 32, alignItems: 'center', gap: 12 }}><ImageIcon size={32} color={colors.primary} /><Text style={[styles.muted, { textAlign: 'center' }]}>Seleccioná fotos o tomá una foto para registrar la evolución</Text></View></Pressable>}
    <Field label="Procedimiento" value={procedure} onChangeText={setProcedure} /><Field label="Notas" value={notes} onChangeText={setNotes} multiline />
    </View>
    <Button title={busy ? 'Procesando…' : uris.length === 1 ? 'Guardar foto' : `Guardar ${uris.length} fotos`} onPress={save} disabled={busy || !uris.length} />
  </Page>
}
