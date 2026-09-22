import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Alert, FlatList, Pressable, Text, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { Clock, DollarSign, Trash2 } from 'lucide-react-native'
import { MonthCalendar } from './MonthCalendar'
import { AppointmentDatePicker } from './AppointmentDatePicker'
import { Avatar, FAB, IconButton } from './chrome'
import { onForeground } from '../platform/foreground'
import type { Appointment } from '../types'
import { useStore } from '../store'
import { formatDate, getClientFullName, getTimeSlots, STATUS_LABELS } from '../utils'
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
    {!!appointment.notes && <Text style={styles.text}>{appointment.notes}</Text>}{onClient && <Button secondary title="Ver paciente" onPress={onClient} />}
  </Pressable>
}
export function ScheduleScreen() {
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
  const [now, setNow] = useState(() => Date.now())
  const { appointments, clients, deleteAppointment } = useStore()
  useEffect(() => { const refresh = () => setNow(Date.now()); const timer = setInterval(refresh, 60000); const off = onForeground(refresh); return () => { clearInterval(timer); off() } }, [])
  const day = formatDate(date, 'yyyy-MM-dd')
  const items = appointments.filter(a => a.date === day).sort((a, b) => a.time.localeCompare(b.time))
  const counts = appointments.reduce<Record<string, number>>((result, a) => { result[a.date] = (result[a.date] || 0) + 1; return result }, {})
  const nextId = appointments.filter(a => a.status === 'scheduled' && new Date(a.date + 'T' + a.time).getTime() >= now).sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time))[0]?.id
  const book = () => navigation.navigate('SelectPatient', { date: day })
  return <View style={styles.page}>
    <FlatList contentContainerStyle={[styles.content, { gap: 8, paddingBottom: 200 }]} data={items} keyExtractor={a => a.id} ListHeaderComponent={<View style={{ gap: 20, paddingBottom: 8 }}>
      <MonthCalendar month={calendar.month} selected={date} onMonth={setMonth} onSelect={setDate} counts={counts} />
      <View><Text style={[styles.heading, { textTransform: 'capitalize' }]}>Turnos — {formatDate(date, 'EEEE d')}</Text><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}><Text style={[styles.muted, { textTransform: 'capitalize', fontSize: 12 }]}>{formatDate(date, "MMMM 'de' yyyy")}</Text>{items.length > 0 && <Text style={{ color: colors.primary, fontFamily: fonts.bold, fontSize: 12, backgroundColor: colors.soft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 }}>{items.length} {items.length === 1 ? 'turno' : 'turnos'}</Text>}</View></View>
    </View>} ListEmptyComponent={<Empty icon={Clock} title="Sin turnos" detail="No hay turnos programados para este día. Agendá el primer turno desde el botón de abajo." action={{ title: 'Agendar turno', onPress: book }} />} renderItem={({ item, index }) => {
      const client = clients.find(c => c.id === item.clientId)
      return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 12, alignSelf: 'stretch', justifyContent: 'center' }}>{index > 0 && <View style={{ position: 'absolute', top: -8, bottom: '50%', left: 5, width: 1, backgroundColor: '#D5C59A' }} />}{index < items.length - 1 && <View style={{ position: 'absolute', top: '50%', bottom: -8, left: 5, width: 1, backgroundColor: '#D5C59A' }} />}<View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.primary, backgroundColor: nextId === item.id ? colors.primary : colors.bg }} /></View>
        <Text style={{ color: colors.primary, fontFamily: fonts.extra, fontSize: 14 }}>{item.time}</Text>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: ['#EEE5D2', '#F0E7D7', '#F2E5D6'][index % 3], padding: 12, borderRadius: 16 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={'Editar turno de ' + (client ? getClientFullName(client) : 'paciente')} onPress={() => navigation.navigate('AppointmentForm', { appointmentId: item.id, fromAgenda: true })} style={{ flex: 1, gap: 5, minHeight: 48, justifyContent: 'center' }}><Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.text }}>{client ? getClientFullName(client) : 'Paciente'}</Text><Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.muted }}>{item.procedure}</Text>{!(item.status === 'scheduled' && new Date(item.date + 'T' + item.time).getTime() < now) && <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: colors.primary }}>{STATUS_LABELS[item.status]}</Text>}</Pressable>
          <IconButton icon={Trash2} label="Eliminar turno" color={colors.muted} onPress={() => confirmDelete('Se eliminará este turno de la agenda.', () => deleteAppointment(item.id))} />
        </View>
      </View>
    }} />
    <FAB label="Agendar" onPress={book} />
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
  const [notes, setNotes] = useState(existing?.notes || '')
  const status = existing?.status || 'scheduled'
  const paid = existing?.paid || false
  const [errors, setErrors] = useState<{ time?: string; procedure?: string }>({})
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const client = store.clients.find(c => c.id === clientId)
  const activeTab = route.params?.fromAgenda ? 'Agenda' : 'Pacientes'
  const day = formatDate(date, 'yyyy-MM-dd')
  const occupied = new Set(store.appointments.filter(a => a.id !== existing?.id && a.date === day && a.status !== 'cancelled').map(a => a.time))
  const slots = getTimeSlots()
  if (existing?.time && !slots.includes(existing.time)) slots.push(existing.time)
  slots.sort()
  const appointmentDates = new Set(store.appointments.map(a => a.date))
  const finish = () => { if (route.params?.fromAgenda) navigation.popTo('Home', { screen: 'Agenda', params: { date: day } }); else navigation.goBack() }

  if (route.params?.appointmentId && !existing) return <Page activeTab={activeTab}><Empty title="Turno no encontrado" detail="Volvé a la agenda." /></Page>
  if (!client) return <Page activeTab={activeTab}><Empty title="Paciente no encontrado" detail="El paciente no existe" /></Page>

  const save = () => {
    if (savingRef.current) return
    const nextErrors: typeof errors = {}
    if (!PROCEDURES.some(p => p === procedure)) nextErrors.procedure = 'Elegí un motivo de consulta'
    if (!time || !slots.includes(time)) nextErrors.time = 'La hora es requerida'
    else if (status !== 'cancelled' && useStore.getState().appointments.some(a => a.id !== existing?.id && a.date === day && a.time === time && a.status !== 'cancelled')) nextErrors.time = 'Ya hay un turno agendado para esta fecha y hora'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    savingRef.current = true
    setSaving(true)
    let saved = false
    attempt(() => {
      const data = { clientId, date: day, time, procedure, notes: notes.trim() || undefined, status, paid }
      if (existing) store.updateAppointment(existing.id, data)
      else store.addAppointment(data)
      saved = true
      finish()
    })
    if (!saved) { savingRef.current = false; setSaving(false) }
  }
  return <Page activeTab={activeTab}>
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
        <SelectField label="Hora" maxOptionsHeight={216} value={time} onChange={value => { setTime(value); setErrors({}) }} placeholder="Elegir hora" options={slots.map(slot => ({ value: slot, label: slot + (occupied.has(slot) ? ' · Ocupado' : ''), disabled: status !== 'cancelled' && occupied.has(slot) }))} />
        {errors.time && <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 12 }}>{errors.time}</Text>}
        {slots.every(slot => occupied.has(slot)) && <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 12 }}>No quedan horarios libres. Elegí otra fecha.</Text>}
      </View>
    </View>
    <View style={[styles.card, { gap: 16 }]}>
      <View style={{ gap: 6 }}>
        <SelectField label="Motivo de consulta" maxOptionsHeight={216} value={procedure} onChange={value => { setProcedure(value); setErrors({}) }} placeholder="Elegir motivo de consulta" options={PROCEDURES.map(p => ({ label: p, value: p }))} />
        {errors.procedure && <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 12 }}>{errors.procedure}</Text>}
      </View>
      <Field label="Notas" value={notes} onChangeText={setNotes} placeholder="Notas adicionales..." multiline />
    </View>
    <Button title={saving ? (existing ? 'Guardando...' : 'Agendando...') : existing ? 'Guardar cambios' : 'Agendar turno'} onPress={save} disabled={saving || !time} />
    {existing && <Button danger title="Eliminar turno" onPress={() => confirmDelete('Se eliminará este turno de la agenda.', () => { store.deleteAppointment(existing.id); finish() })} />}
  </Page>
}
