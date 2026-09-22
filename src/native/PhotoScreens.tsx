import { useState } from 'react'
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
import { PHOTO_DIRECTORY } from './photoFiles'

export function PhotoFormScreen({ route, navigation }: ScreenProps<'PhotoForm'>) {
  const clientId = route.params.clientId
  const store = useStore()
  const [uri, setUri] = useState('')
  const [type, setType] = useState<PhotoType>('before')
  const [procedure, setProcedure] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const pick = async (camera: boolean) => {
    setBusy(true)
    try {
      if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) { Alert.alert('Permiso de cámara', 'Permití el acceso a la cámara en los ajustes del celular o elegí una foto de la galería.'); return }
      const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 })
      if (!result.canceled && result.assets[0]) setUri(result.assets[0].uri)
    } catch { Alert.alert('No se pudo abrir la foto', 'Intentá nuevamente con la cámara o la galería.') }
    finally { setBusy(false) }
  }
  const chooseSource = () => {
    if (Platform.OS === 'ios') ActionSheetIOS.showActionSheetWithOptions({ options: ['Cancelar', 'Tomar foto', 'Elegir de galería'], cancelButtonIndex: 0 }, index => { if (index === 1 || index === 2) void pick(index === 1) })
    else Alert.alert('Seleccionar imagen', undefined, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Tomar foto', onPress: () => { void pick(true) } }, { text: 'Elegir de galería', onPress: () => { void pick(false) } }])
  }
  const save = () => {
    if (!uri) { Alert.alert('Falta la foto', 'Tomá una foto o elegí una de la galería.'); return }
    setBusy(true)
    let copied: File | undefined
    try {
      const directory = new Directory(Paths.document, PHOTO_DIRECTORY)
      directory.create({ idempotent: true, intermediates: true })
      const extension = uri.split('?')[0].match(/\.(jpe?g|png|heic|webp)$/i)?.[1] || 'jpg'
      const name = `${generateId()}.${extension}`
      copied = new File(directory, name)
      new File(uri).copy(copied)
      store.addPhoto({ clientId, fileUrl: `${PHOTO_DIRECTORY}/${name}`, type, procedure: procedure.trim(), notes: notes.trim(), takenAt: new Date().toISOString() })
      navigation.goBack()
    } catch {
      if (copied?.exists) copied.delete()
      Alert.alert('No se pudo guardar', 'Verificá el espacio disponible e intentá nuevamente.')
    } finally { setBusy(false) }
  }
  const client = store.clients.find(c => c.id === clientId)
  if (!client) return <Page><Empty title="Paciente no encontrado" detail="Volvé a la lista de pacientes." /></Page>
  return <Page><View style={[styles.card, styles.row]}><Avatar {...client} /><View style={{ flex: 1 }}><Text style={styles.heading}>{getClientFullName(client)}</Text><Text style={styles.muted}>Paciente</Text></View></View>
    <View style={{ flexDirection: 'row', gap: 12 }}>{(['before', 'after'] as const).map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: type === value }} onPress={() => setType(value)} style={[styles.button, { flex: 1, backgroundColor: type === value ? colors.primary : colors.tint }]}><Text style={[styles.buttonText, type !== value && { color: colors.text }]}>{PHOTO_TYPE_LABELS[value]}</Text></Pressable>)}</View>
    <View style={styles.card}>
    <Pressable accessibilityRole="button" accessibilityLabel={uri ? 'Cambiar imagen' : 'Seleccionar imagen para registrar la evolución'} accessibilityState={{ disabled: busy }} disabled={busy} onPress={chooseSource}>{uri ? <Image source={{ uri }} accessibilityLabel="Vista previa de la foto" style={styles.photo} resizeMode="contain" /> : <View style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 16, padding: 32, alignItems: 'center', gap: 12 }}><ImageIcon size={40} color={colors.primary} /><Text style={[styles.muted, { textAlign: 'center' }]}>Seleccioná una imagen para registrar la evolución</Text></View>}</Pressable>
    <Field label="Procedimiento" value={procedure} onChangeText={setProcedure} /><Field label="Notas" value={notes} onChangeText={setNotes} multiline />
    </View>
    <Button title={busy ? 'Procesando…' : 'Guardar foto'} onPress={save} disabled={busy || !uri} />
  </Page>
}
