import { useRef, useState } from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from 'lucide-react-native'
import { useStore } from '../store'
import { formatDate, getClientFullName, getTimeSlots } from '../utils'
import { PROCEDURES } from '../utils/procedures'
import { Avatar, IconButton } from './chrome'
import type { ScreenProps } from './navigation'
import { Button, DateField, SelectField } from './ui'
import { colors, fonts, styles } from './theme'

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim()
const slots = getTimeSlots()

export function SelectPatientScreen({ route, navigation }: ScreenProps<'SelectPatient'>) {
  const { clients, appointments, addAppointment } = useStore()
  const [search, setSearch] = useState('')
  const [clientId, setClientId] = useState(route.params.clientId || '')
  const [date, setDate] = useState(() => new Date(`${route.params.date}T12:00:00`))
  const [time, setTime] = useState('')
  const [procedure, setProcedure] = useState('')
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [error, setError] = useState('')
  const saving = useRef(false)
  const client = clients.find(c => c.id === clientId)
  const day = formatDate(date, 'yyyy-MM-dd')
  const occupied = new Set(appointments.filter(a => a.date === day && a.status !== 'cancelled').map(a => a.time))
  const query = normalize(search)
  const matches = clients.filter(c => normalize([getClientFullName(c), c.phone, c.email].filter(Boolean).join(' ')).includes(query))
  const close = () => { Keyboard.dismiss(); navigation.goBack() }
  const save = () => {
    if (saving.current) return
    const latest = useStore.getState()
    if (!latest.clients.some(c => c.id === clientId)) { setError('Elegí un cliente para continuar.'); return }
    if (!slots.includes(time)) { setError('Elegí una hora disponible.'); return }
    if (latest.appointments.some(a => a.date === day && a.time === time && a.status !== 'cancelled')) { setError('Ese horario ya está ocupado. Elegí otro.'); return }
    if (!PROCEDURES.some(p => p === procedure)) { setError('Elegí un tratamiento.'); return }
    saving.current = true
    try {
      addAppointment({ clientId, date: day, time, procedure, notes: notes.trim() || undefined, status: 'scheduled', paid: false })
    } catch {
      saving.current = false
      setError('No se pudo guardar el turno. Intentá nuevamente.')
      return
    }
    Keyboard.dismiss()
    navigation.popTo('Home', { screen: 'Agenda', params: { date: day } })
  }
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#00000066' }}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Pressable accessibilityLabel="Cerrar agendado" accessibilityRole="button" onPress={close} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
      <View accessibilityViewIsModal style={{ width: '100%', maxWidth: clientId ? 440 : 380, maxHeight: clientId ? '90%' : '65%', backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 }}>
          {!!clientId && <IconButton icon={ChevronLeft} label="Volver a elegir cliente" onPress={() => { Keyboard.dismiss(); setClientId(''); setError('') }} />}
          <Text accessibilityRole="header" style={[styles.heading, { flex: 1, fontSize: 18 }]}>{clientId ? 'Agendar turno' : '¿Para quién es el turno?'}</Text>
          <IconButton icon={X} label="Cerrar" onPress={close} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" style={{ flexGrow: 0 }} contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 16 }}>
          {!clientId ? <>
            <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}><Search size={20} color={colors.muted} /><TextInput accessibilityLabel="Buscar clientes" placeholder="Buscar cliente..." placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} autoCorrect={false} style={{ flex: 1, padding: 0, fontFamily: fonts.regular, fontSize: 16, color: colors.text }} /></View>
            <Text style={styles.muted}>{matches.length} {matches.length === 1 ? 'cliente' : 'clientes'}</Text>
            <View>{matches.map(c => <Pressable key={c.id} accessibilityRole="button" onPress={() => { Keyboard.dismiss(); setClientId(c.id) }} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 68, paddingVertical: 8, opacity: pressed ? 0.6 : 1 })}><Avatar {...c} size={40} /><View style={{ flex: 1 }}><Text style={[styles.text, { fontFamily: fonts.semibold }]}>{getClientFullName(c)}</Text>{!!(c.phone || c.email) && <Text style={styles.muted}>{c.phone || c.email}</Text>}</View><ChevronRight size={20} color={colors.primary} /></Pressable>)}</View>
            {!matches.length && <Text style={styles.muted}>{clients.length ? 'No encontramos clientes con esos datos.' : 'Agregá tu primer cliente para agendar un turno.'}</Text>}
            {!clients.length && <Button title="Agregar cliente" onPress={() => navigation.replace('ClientForm', { appointmentDate: day })} />}
          </> : <>
            <Text style={styles.muted}>Para <Text style={{ fontFamily: fonts.semibold, color: colors.text }}>{client ? getClientFullName(client) : 'Cliente no disponible'}</Text></Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><DateField label="Día" value={date} onChange={value => { setDate(value); setTime(''); setError('') }} /></View>
              <View style={{ flex: 1 }}><SelectField label="Hora" maxOptionsHeight={216} value={time} placeholder="Elegir hora" onChange={value => { setTime(value); setError('') }} options={slots.map(value => ({ value, label: value + (occupied.has(value) ? ' · Ocupado' : ''), disabled: occupied.has(value) }))} /></View>
            </View>
            {slots.every(slot => occupied.has(slot)) && <Text style={{ color: colors.danger }}>No quedan horarios libres. Elegí otro día.</Text>}
            <SelectField label="Tratamiento" value={procedure} placeholder="Elegir tratamiento" onChange={value => { setProcedure(value); setError('') }} options={PROCEDURES.map(value => ({ value, label: value }))} />
            <View style={{ gap: 4 }}><Pressable accessibilityRole="button" accessibilityState={{ expanded: showNotes }} onPress={() => setShowNotes(!showNotes)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 }}><Text style={styles.text}>Notas</Text>{showNotes ? <ChevronDown size={18} color={colors.muted} /> : <ChevronRight size={18} color={colors.muted} />}</Pressable>
              {showNotes && <TextInput accessibilityLabel="Notas del tratamiento" placeholder="Comentario breve sobre el tratamiento" placeholderTextColor={colors.muted} value={notes} onChangeText={setNotes} multiline style={[styles.input, { minHeight: 76, textAlignVertical: 'top' }]} />}
            </View>
            {!!error && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text>}
            <Button title="Confirmar turno" onPress={save} disabled={!client || !time || !procedure || occupied.has(time)} />
          </>}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
}
