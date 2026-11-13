import { usePageGeometry } from './usePageGeometry'
import { appointmentAttribution, attendingOptions, parseProfile } from '../utils/profiles'
import type { Profile } from '../types'
import { useLayoutEffect, useRef, useState } from 'react'
import { Alert, FlatList, Pressable, ScrollView, Text, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { Clock, DollarSign, Trash2 } from 'lucide-react-native'
import { MonthCalendar } from './MonthCalendar'
import { AppointmentDatePicker } from './AppointmentDatePicker'
import { Avatar, FAB, IconButton } from './chrome'
import type { Appointment } from '../types'
import { useStore } from '../store'
import { formatDate, getClientFullName, getTimeSlots } from '../utils'
import { PROCEDURES } from '../utils/procedures'
import type { MainTabs, RootStack, ScreenProps } from './navigation'
import { Button, Empty, Field, Page, SelectField } from './ui'
import { colors, fonts, styles } from './theme'
import { attempt, confirmDelete } from './actions'

export function AppointmentCard({ appointment, onEdit, onClient }: { appointment: Appointment; onEdit: () => void; onClient?: () => void }) {
  const update = useStore(s => s.updateAppointment)
  const confirmPayment = () => Alert.alert(appointment.paid ? 'Cambiar pago' : 'Confirmar pago', appointment.paid ? '¿Marcar esta consulta como pendiente de pago?' : '¿La persona pagó esta consulta?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Confirmar', onPress: () => attempt(() => update(appointment.id, { paid: !appointment.paid })) }])
  return <Pressable accessibilityRole="button" accessibilityLabel={'Editar turno del ' + formatDate(appointment.date)} onPress={onEdit} style={styles.card}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ flex: 1, gap: 4 }}><Text style={styles.heading}>{formatDate(appointment.date, 'dd MMM yyyy')}</Text><Text style={styles.muted}>{appointment.time} · {appointment.procedure || 'Consulta'}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={appointment.paid ? 'Pagado. Cambiar a pendiente' : 'Confirmar pago'} onPress={event => { event.stopPropagation(); confirmPayment() }} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><DollarSign size={22} color={appointment.paid ? '#15803D' : colors.muted} /></Pressable></View>
    <Text style={styles.muted}>{appointmentAttribution(appointment)}</Text>
    {!!appointment.notes && <Text style={styles.text}>{appointment.notes}</Text>}{onClient && <Button secondary title="Ver paciente" onPress={onClient} />}
  </Pressable>
}
export function ScheduleScreen() {
  const insets = useSafeAreaInsets()
  const { frame, wide } = usePageGeometry('agenda')
  const navigation = useNavigation<NativeStackNavigationProp<RootStack>>()
  const tabNavigation = useNavigation<BottomTabNavigationProp<MainTabs, 'Agenda'>>()
  const route = useRoute<RouteProp<MainTabs, 'Agenda'>>()
  const [calendar, setCalendar] = useState(() => {
    const selectedDay = route.params?.date || formatDate(new Date(), 'yyyy-MM-dd')
    return { selection: route.params, selectedDay, month: new Date(`${selectedDay}T12:00:00`) }
  })
  const selectedDay = route.params?.date || calendar.selectedDay
  const date = new Date(`${selectedDay}T12:00:00`)
  if (calendar.selection !== route.params) setCalendar({ selection: route.params, selectedDay, month: route.params?.date ? date : calendar.month })
  const setDate = (value: Date) => tabNavigation.setParams({ date: formatDate(value, 'yyyy-MM-dd') })
  const setMonth = (value: Date) => setCalendar({ selection: route.params, selectedDay, month: value })
  const { appointments, clients, deleteAppointment } = useStore()
  const day = formatDate(date, 'yyyy-MM-dd')
  const items = appointments.filter(a => a.date === day).sort((a, b) => a.time.localeCompare(b.time))
  const counts = appointments.reduce<Record<string, number>>((result, a) => { result[a.date] = (result[a.date] || 0) + 1; return result }, {})
  const book = () => navigation.navigate('SelectPatient', { date: day })
  const month = <MonthCalendar month={calendar.month} selected={date} onMonth={setMonth} onSelect={setDate} counts={counts} />
  return <View style={styles.page}>
    <View style={{ flex: 1, minHeight: 0, flexDirection: wide ? 'row' : 'column', ...frame }}>
    {wide && <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>{month}</ScrollView>}
    <FlatList style={{ flex: 1 }} contentContainerStyle={[styles.content, { gap: 0, paddingBottom: Math.max(insets.bottom, 12) + 164 }]} data={items} keyExtractor={a => a.id} ListHeaderComponent={<View style={{ gap: 20, paddingBottom: 8 }}>
      {!wide && month}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text accessible={false} importantForAccessibility="no" style={{ fontFamily: fonts.medium, fontSize: 36, color: colors.text, fontVariant: ['tabular-nums'] }}>{formatDate(date, 'd')}</Text>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text accessibilityRole="header" accessibilityLabel={formatDate(date, 'EEEE d')} style={[styles.heading, { textTransform: 'capitalize' }]}>{formatDate(date, 'EEEE')}</Text>
          <Text style={styles.muted}>{formatDate(date, "MMMM 'de' yyyy")}</Text>
        </View>
        <Text style={styles.muted}>{items.length} {items.length === 1 ? 'turno' : 'turnos'}</Text>
      </View>
    </View>} ListEmptyComponent={<Empty icon={Clock} title="Sin turnos" detail="No hay turnos programados para este día. Agendá el primer turno desde el botón de abajo." action={{ title: 'Agendar turno', onPress: book }} />} renderItem={({ item }) => {
      const client = clients.find(c => c.id === item.clientId)
      return <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.edge }}>
          <Pressable accessibilityRole="button" accessibilityLabel={'Editar turno de ' + (client ? getClientFullName(client) : 'paciente')} onPress={() => navigation.navigate('AppointmentForm', { appointmentId: item.id, fromAgenda: true })} style={({ pressed }) => ({ flex: 1, minWidth: 0, gap: 2, minHeight: 48, justifyContent: 'center', backgroundColor: pressed ? colors.soft : 'transparent' })}>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, color: colors.text }}>{client ? getClientFullName(client) : 'Paciente'}<Text style={{ fontFamily: fonts.regular, color: colors.muted }}> · {item.time}</Text></Text>
            <Text style={styles.muted}>{item.procedure || 'Consulta'}</Text>
            <Text style={styles.muted}>{appointmentAttribution(item)}</Text>
          </Pressable>
          <IconButton icon={Trash2} label="Eliminar turno" color={colors.muted} onPress={() => confirmDelete('Se eliminará este turno de la agenda.', () => deleteAppointment(item.id))} />
      </View>
    }} />
    </View>
    <FAB agenda label="Agendar" onPress={book} />
  </View>
}
export function AppointmentFormScreen({ route, navigation }: ScreenProps<'AppointmentForm'>) {
  const store = useStore()
  const existing = store.appointments.find(a => a.id === route.params?.appointmentId)
  useLayoutEffect(() => { navigation.setOptions({ title: existing ? 'Editar turno' : route.params?.fromAgenda ? 'Agendar turno' : 'Nuevo turno' }) }, [existing, navigation, route.params?.fromAgenda])
  const clientId = existing?.clientId || route.params?.clientId || ''
  const [date, setDate] = useState(() => new Date(`${existing?.date || route.params?.date || formatDate(new Date(), 'yyyy-MM-dd')}T12:00:00`))
  const [time, setTime] = useState(existing?.time || '09:00')
  const [procedure, setProcedure] = useState(existing?.procedure || '')
  const [attendedBy, setAttendedBy] = useState<Profile | undefined>(existing?.attendedBy)
  const [notes, setNotes] = useState(existing?.notes || '')
  const status = existing?.status || 'scheduled'
  const paid = existing?.paid || false
  const [errors, setErrors] = useState<{ time?: string; procedure?: string }>({})
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const client = store.clients.find(c => c.id === clientId)
  const day = formatDate(date, 'yyyy-MM-dd')
  const occupied = new Set(store.appointments.filter(a => a.id !== existing?.id && a.date === day && a.status !== 'cancelled').map(a => a.time))
  const selectedTime = status !== 'cancelled' && occupied.has(time) ? '' : time
  const slots = getTimeSlots()
  if (existing?.time && !slots.includes(existing.time)) slots.push(existing.time)
  slots.sort()
  const appointmentDates = new Set(store.appointments.map(a => a.date))
  const finish = () => { if (route.params?.fromAgenda) navigation.popTo('Home', { screen: 'Agenda', params: { date: day } }); else navigation.goBack() }

  if (route.params?.appointmentId && !existing) return <Page><Empty title="Turno no encontrado" detail="Volvé a la agenda." /></Page>
  if (!client) return <Page><Empty title="Paciente no encontrado" detail="El paciente no existe" /></Page>

  const save = () => {
    if (savingRef.current) return
    const nextErrors: typeof errors = {}
    const procedureChanged = !existing || procedure !== (existing.procedure ?? '')
    if (procedureChanged && !PROCEDURES.some(p => p === procedure)) nextErrors.procedure = 'Elegí un motivo de consulta'
    if (!time || !slots.includes(time)) nextErrors.time = 'La hora es requerida'
    else if (status !== 'cancelled' && useStore.getState().appointments.some(a => a.id !== existing?.id && a.date === day && a.time === time && a.status !== 'cancelled')) nextErrors.time = 'Ya hay un turno agendado para esta fecha y hora'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    savingRef.current = true
    setSaving(true)
    let saved = false
    attempt(() => {
      const data = { clientId, date: day, time, attendedBy, notes: notes.trim() || undefined }
      if (existing) store.updateAppointment(existing.id, { ...data, ...(procedureChanged ? { procedure } : {}) })
      else store.addAppointment({ ...data, procedure, status, paid })
      saved = true
      finish()
    })
    if (!saved) { savingRef.current = false; setSaving(false) }
  }
  return <Page>
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar {...client} />
        <View style={{ flex: 1 }}><Text style={{ fontFamily: fonts.semibold, fontSize: 16, color: colors.text }}>{getClientFullName(client)}</Text><Text style={styles.muted}>Paciente</Text></View>
      </View>
    </View>
    <View style={[styles.card, { gap: 16 }]}>
      <View style={{ gap: 6 }}>
        <Text style={styles.label}>Fecha</Text>
        <AppointmentDatePicker selected={date} appointmentDates={appointmentDates} onSelect={value => { setDate(value); setErrors({}) }} />
      </View>
      <View style={{ gap: 6 }}>
        <SelectField label="Hora" maxOptionsHeight={216} value={selectedTime} onChange={value => { setTime(value); setErrors({}) }} placeholder="Elegir hora" options={slots.map(slot => ({ value: slot, label: slot + (occupied.has(slot) ? ' · Ocupado' : ''), disabled: status !== 'cancelled' && occupied.has(slot) }))} />
        <Text style={styles.muted}>Los horarios ocupados no se pueden elegir.</Text>
        {errors.time && <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 12 }}>{errors.time}</Text>}
        {slots.every(slot => occupied.has(slot)) && <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 12 }}>No quedan horarios libres. Elegí otra fecha.</Text>}
      </View>
    </View>
    <View style={[styles.card, { gap: 16 }]}>
      <View style={{ gap: 6 }}>
        <SelectField label="Motivo de consulta" maxOptionsHeight={216} value={procedure} onChange={value => { setProcedure(value); setErrors({}) }} placeholder="Elegir motivo de consulta" options={PROCEDURES.map(p => ({ label: p, value: p }))} />
        {errors.procedure && <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 12 }}>{errors.procedure}</Text>}
      </View>
      <SelectField label="Atiende:" value={attendedBy ?? ''} options={attendingOptions} onChange={value => setAttendedBy(parseProfile(value))} />
      <Field label="Notas" value={notes} onChangeText={setNotes} placeholder="Notas adicionales..." multiline />
    </View>
    <Button title={saving ? (existing ? 'Guardando...' : 'Agendando...') : existing ? 'Guardar cambios' : 'Agendar turno'} onPress={save} disabled={saving || !selectedTime} />
    {existing && <Button danger title="Eliminar turno" onPress={() => confirmDelete('Se eliminará este turno de la agenda.', () => { store.deleteAppointment(existing.id); finish() })} />}
  </Page>
}
