import { useState } from 'react'
import { FlatList, Switch, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { addDays } from 'date-fns'
import type { Appointment, AppointmentStatus } from '../types'
import { useStore } from '../store'
import { formatDate, getClientFullName, STATUS_LABELS } from '../utils'
import { PROCEDURES } from '../utils/procedures'
import type { RootStack, ScreenProps } from './navigation'
import { Button, Choices, DateField, Empty, Field, Page } from './ui'
import { colors, styles } from './theme'
import { attempt, confirmDelete } from './actions'

export function AppointmentCard({ appointment, onEdit, onClient }: { appointment: Appointment; onEdit: () => void; onClient?: () => void }) {
  const client = useStore(s => s.clients.find(c => c.id === appointment.clientId))
  return <View style={styles.card}><Text style={styles.heading}>{appointment.time} · {appointment.procedure || 'Consulta'}</Text><Text style={styles.text}>{client ? getClientFullName(client) : 'Paciente no encontrado'}</Text><Text style={styles.muted}>{formatDate(appointment.date)} · {STATUS_LABELS[appointment.status]} · {appointment.paid ? 'Pagado' : 'Sin pagar'}</Text>{appointment.notes && <Text style={styles.text}>{appointment.notes}</Text>}<View style={styles.row}><Button secondary title="Editar turno / pago" onPress={onEdit} />{onClient && <Button secondary title="Ver paciente" onPress={onClient} />}</View></View>
}
export function ScheduleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStack>>()
  const [date, setDate] = useState(new Date())
  const appointments = useStore(s => s.appointments)
  const day = formatDate(date, 'yyyy-MM-dd')
  const items = appointments.filter(a => a.date === day).sort((a, b) => a.time.localeCompare(b.time))
  return <View style={styles.page}><FlatList contentContainerStyle={styles.content} data={items} keyExtractor={a => a.id} ListHeaderComponent={<View style={{ gap: 16 }}><Text style={styles.title}>Agenda</Text><DateField label="Fecha de la agenda" value={date} onChange={setDate} /><View style={styles.row}><Button secondary title="Anterior" onPress={() => setDate(addDays(date, -1))} /><Button secondary title="Hoy" onPress={() => setDate(new Date())} /><Button secondary title="Siguiente" onPress={() => setDate(addDays(date, 1))} /></View><Button title="Agendar turno" onPress={() => navigation.navigate('AppointmentForm', { date: day })} /><Text style={styles.muted}>{items.length} turnos</Text></View>} ListEmptyComponent={<Empty title="Día sin turnos" detail="Elegí otra fecha o agendá una consulta." />} renderItem={({ item }) => <AppointmentCard appointment={item} onEdit={() => navigation.navigate('AppointmentForm', { appointmentId: item.id })} onClient={() => navigation.navigate('Client', { id: item.clientId })} />} /></View>
}
export function AppointmentFormScreen({ route, navigation }: ScreenProps<'AppointmentForm'>) {
  const store = useStore()
  const existing = store.appointments.find(a => a.id === route.params?.appointmentId)
  const [clientId, setClientId] = useState(existing?.clientId || route.params?.clientId || '')
  const [query, setQuery] = useState('')
  const [date, setDate] = useState(new Date(`${existing?.date || route.params?.date || formatDate(new Date(), 'yyyy-MM-dd')}T${existing?.time || '09:00'}:00`))
  const [procedure, setProcedure] = useState(existing?.procedure || '')
  const [notes, setNotes] = useState(existing?.notes || '')
  const [status, setStatus] = useState<AppointmentStatus>(existing?.status || 'scheduled')
  const [paid, setPaid] = useState(existing?.paid || false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const client = store.clients.find(c => c.id === clientId)
  if (route.params?.appointmentId && !existing) return <Page><Empty title="Turno no encontrado" detail="Volvé a la agenda." /></Page>
  const save = () => {
    const day = formatDate(date, 'yyyy-MM-dd'), time = formatDate(date, 'HH:mm')
    if (!client) return setError('Seleccioná un paciente.')
    if (!PROCEDURES.some(p => p === procedure)) return setError('Elegí un motivo de consulta disponible.')
    if (status !== 'cancelled' && store.appointments.some(a => a.id !== existing?.id && a.date === day && a.time === time && a.status !== 'cancelled')) return setError('Ya hay un turno para esa fecha y hora.')
    setError(''); setSaving(true)
    attempt(() => {
      const data = { clientId, date: day, time, procedure, notes: notes.trim(), status, paid }
      if (existing) store.updateAppointment(existing.id, data)
      else store.addAppointment(data)
      navigation.goBack()
    })
    setSaving(false)
  }
  return <Page><Text style={styles.title}>{existing ? 'Editar turno' : 'Nuevo turno'}</Text>
    {client ? <View style={styles.card}><Text style={styles.heading}>{getClientFullName(client)}</Text><Button secondary title="Cambiar paciente" onPress={() => setClientId('')} /></View> : <><Field label="Buscar paciente" value={query} onChangeText={setQuery} />{store.clients.filter(c => getClientFullName(c).toLowerCase().includes(query.toLowerCase())).map(c => <Button key={c.id} secondary title={getClientFullName(c)} onPress={() => setClientId(c.id)} />)}{!store.clients.length && <><Empty title="Primero agregá un paciente" detail="Después podrás asignarle este turno." /><Button title="Nuevo paciente" onPress={() => navigation.navigate('ClientForm')} /></>}</>}
    <DateField label="Fecha" value={date} onChange={value => { const next = new Date(date); next.setFullYear(value.getFullYear(), value.getMonth(), value.getDate()); setDate(next) }} />
    <DateField label="Hora" value={date} mode="time" onChange={value => { const next = new Date(date); next.setHours(value.getHours(), value.getMinutes(), 0, 0); setDate(next) }} />
    <Choices label="Motivo de consulta *" value={procedure} onChange={setProcedure} options={PROCEDURES.map(p => ({ label: p, value: p }))} />
    <Choices label="Estado" value={status} onChange={setStatus} options={(Object.keys(STATUS_LABELS) as AppointmentStatus[]).map(value => ({ value, label: STATUS_LABELS[value] }))} />
    <View style={styles.row}><Text style={styles.text}>Pago registrado</Text><Switch accessibilityLabel="Pago registrado" value={paid} onValueChange={setPaid} trackColor={{ true: colors.primary }} /></View>
    <Field label="Notas" value={notes} onChangeText={setNotes} multiline />
    {!!error && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text>}
    <Button title="Guardar turno" onPress={save} disabled={saving} />
    {existing && <Button danger title="Eliminar turno" onPress={() => confirmDelete('Se eliminará este turno de la agenda.', () => { store.deleteAppointment(existing.id); navigation.goBack() })} />}
  </Page>
}
