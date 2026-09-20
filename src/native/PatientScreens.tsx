import { useState } from 'react'
import { Alert, FlatList, Linking, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStore } from '../store'
import { formatDate, getClientFullName } from '../utils'
import type { RootStack, ScreenProps } from './navigation'
import { Button, DateField, Empty, Field, Page } from './ui'
import { styles } from './theme'
import { attempt, confirmDelete } from './actions'
import { AppointmentCard } from './ScheduleScreens'

export function PatientsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStack>>()
  const clients = useStore(s => s.clients)
  const [query, setQuery] = useState('')
  const normalized = query.trim().toLocaleLowerCase()
  const filtered = clients.filter(c => `${getClientFullName(c)} ${c.phone || ''} ${c.email || ''}`.toLocaleLowerCase().includes(normalized)).sort((a, b) => getClientFullName(a).localeCompare(getClientFullName(b)))
  return <View style={styles.page}><FlatList contentContainerStyle={styles.content} data={filtered} keyExtractor={c => c.id} keyboardShouldPersistTaps="handled" ListHeaderComponent={<View style={{ gap: 16 }}><Text style={styles.title}>Pacientes</Text><Button title="Nuevo paciente" onPress={() => navigation.navigate('ClientForm')} /><Field label="Buscar paciente" placeholder="Nombre, teléfono o correo" value={query} onChangeText={setQuery} /></View>} ListEmptyComponent={<Empty title={query ? 'Sin coincidencias' : 'Tu primer paciente'} detail={query ? 'Probá con otro nombre o teléfono.' : 'Agregá un paciente para guardar su historia y agendar turnos.'} />} renderItem={({ item }) => <View style={styles.card}><Text style={styles.heading}>{getClientFullName(item)}</Text>{item.phone && <Text style={styles.muted}>{item.phone}</Text>}<Button secondary title="Ver ficha" onPress={() => navigation.navigate('Client', { id: item.id })} /></View>} /></View>
}
export function PatientScreen({ route, navigation }: ScreenProps<'Client'>) {
  const state = useStore()
  const client = state.clients.find(c => c.id === route.params.id)
  if (!client) return <Page><Empty title="Paciente no encontrado" detail="Volvé a la lista de pacientes." /></Page>
  const appointments = state.appointments.filter(a => a.clientId === client.id).sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
  return <Page><Text style={styles.title}>{getClientFullName(client)}</Text><Button secondary title="Editar paciente" onPress={() => navigation.navigate('ClientForm', { id: client.id })} />
    {client.phone && <Button secondary title={`Llamar: ${client.phone}`} onPress={() => { void Linking.openURL(`tel:${client.phone!.replace(/[^+\d]/g, '')}`).catch(() => Alert.alert('No se pudo abrir el teléfono')) }} />}
    {client.email && <Button secondary title={client.email} onPress={() => { void Linking.openURL(`mailto:${encodeURIComponent(client.email!)}`).catch(() => Alert.alert('No se pudo abrir el correo')) }} />}
    {client.dateOfBirth && <Text style={styles.muted}>Nacimiento: {formatDate(client.dateOfBirth)}</Text>}
    <Text style={styles.heading}>Historia clínica</Text><Text style={styles.text}>{client.notes || 'Todavía no hay notas clínicas.'}</Text>
    <View style={styles.row}><Button title="Nuevo turno" onPress={() => navigation.navigate('AppointmentForm', { clientId: client.id })} /><Button secondary title="Fotos" onPress={() => navigation.navigate('Photos', { clientId: client.id })} /></View>
    <Text style={styles.heading}>Turnos · {appointments.length}</Text>
    {!appointments.length && <Empty title="Sin turnos" detail="Agendá la primera consulta de este paciente." />}
    {appointments.map(appointment => <AppointmentCard key={appointment.id} appointment={appointment} onEdit={() => navigation.navigate('AppointmentForm', { appointmentId: appointment.id })} />)}
  </Page>
}
export function PatientFormScreen({ route, navigation }: ScreenProps<'ClientForm'>) {
  const store = useStore()
  const id = route.params?.id
  const existing = store.clients.find(c => c.id === id)
  const [form, setForm] = useState({ firstName: existing?.firstName || '', lastName: existing?.lastName || '', phone: existing?.phone || '', email: existing?.email || '', dateOfBirth: existing?.dateOfBirth || '', notes: existing?.notes || '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const change = (key: keyof typeof form, value: string) => setForm(previous => ({ ...previous, [key]: value }))
  if (id && !existing) return <Page><Empty title="Paciente no encontrado" detail="Volvé a la lista." /></Page>
  const save = () => {
    const next: Record<string, string> = {}
    if (!form.firstName.trim()) next.firstName = 'Ingresá el nombre.'
    if (!form.lastName.trim()) next.lastName = 'Ingresá el apellido.'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Ingresá un correo válido.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    attempt(() => {
      const data = { ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phone: form.phone.trim(), notes: form.notes.trim() }
      if (id) { store.updateClient(id, data); navigation.goBack() }
      else { const client = store.addClient(data); navigation.replace('Client', { id: client.id }) }
    })
    setSaving(false)
  }
  return <Page><Text style={styles.title}>{id ? 'Editar paciente' : 'Nuevo paciente'}</Text>
    <Field label="Nombre *" value={form.firstName} onChangeText={v => change('firstName', v)} error={errors.firstName} autoCapitalize="words" />
    <Field label="Apellido *" value={form.lastName} onChangeText={v => change('lastName', v)} error={errors.lastName} autoCapitalize="words" />
    <Field label="Teléfono" value={form.phone} onChangeText={v => change('phone', v)} keyboardType="phone-pad" />
    <Field label="Correo electrónico" value={form.email} onChangeText={v => change('email', v)} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
    {form.dateOfBirth ? <><DateField label="Fecha de nacimiento" value={new Date(`${form.dateOfBirth}T12:00:00`)} maximumDate={new Date()} onChange={date => change('dateOfBirth', formatDate(date, 'yyyy-MM-dd'))} /><Button secondary title="Quitar fecha de nacimiento" onPress={() => change('dateOfBirth', '')} /></> : <Button secondary title="Agregar fecha de nacimiento" onPress={() => change('dateOfBirth', formatDate(new Date(), 'yyyy-MM-dd'))} />}
    <Field label="Historia clínica / notas" value={form.notes} onChangeText={v => change('notes', v)} multiline />
    <Button title="Guardar paciente" onPress={save} disabled={saving} />
    {id && <Button danger title="Eliminar paciente" onPress={() => confirmDelete('Se eliminarán este paciente, sus turnos y las fotos de su ficha.', () => { store.deleteClient(id); navigation.popToTop() })} />}
  </Page>
}
