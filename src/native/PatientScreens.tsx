import { useLayoutEffect, useState } from 'react'
import { Alert, Linking, Pressable, SectionList, Text, TextInput, View } from 'react-native'
import { Calendar, Camera, ChevronDown, ChevronUp, Edit, Mail, Phone, Search, Users } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStore } from '../store'
import { formatDate, getClientFullName } from '../utils'
import type { RootStack, ScreenProps } from './navigation'
import { Button, Empty, Field, Page } from './ui'
import { BirthDateField } from './BirthDateField'
import { colors, fonts, styles } from './theme'
import { Avatar, FAB, IconButton } from './chrome'
import { PatientGallery } from './PatientGallery'
import { attempt, confirmDelete } from './actions'
import { AppointmentCard } from './ScheduleScreens'

export function PatientsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStack>>()
  const clients = useStore(s => s.clients)
  const [query, setQuery] = useState('')
  const normalized = query.trim().toLocaleLowerCase()
  const filtered = clients.filter(c => `${getClientFullName(c)} ${c.phone || ''} ${c.email || ''}`.toLocaleLowerCase().includes(normalized)).sort((a, b) => getClientFullName(a).localeCompare(getClientFullName(b)))
  const grouped = new Map<string, typeof filtered>()
  for (const client of filtered) {
    const first = client.firstName.trim().toLocaleUpperCase('es')[0] || '#'
    const letter = first === 'Ñ' ? first : first.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    grouped.set(letter, [...(grouped.get(letter) || []), client])
  }
  const create = () => navigation.navigate('ClientForm')
  return <View style={styles.page}>
    <SectionList contentContainerStyle={[styles.content, { paddingBottom: 200 }]} sections={[...grouped].map(([title, data]) => ({ title, data }))} keyExtractor={c => c.id} stickySectionHeadersEnabled={false} keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<View style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 }]}><Search size={22} color={colors.muted} /><TextInput accessibilityLabel="Buscar pacientes por nombre, teléfono o email" placeholder="Buscar por nombre, teléfono o email..." placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} style={{ flex: 1, minHeight: 32, fontFamily: fonts.regular, fontSize: 16, color: colors.text, padding: 0 }} /></View>}
      ListEmptyComponent={<Empty icon={Users} title={query ? 'Sin resultados' : 'Sin pacientes'} detail={query ? 'No se encontraron pacientes con esos datos' : 'Agregá tu primer paciente para comenzar'} action={!query ? { title: 'Agregar paciente', onPress: create } : undefined} />}
      renderSectionHeader={({ section }) => <Text style={[styles.label, { marginTop: 8 }]}>{section.title}</Text>}
      renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={'Ver ficha de ' + getClientFullName(item)} onPress={() => navigation.navigate('Client', { id: item.id })} style={({ pressed }) => [styles.card, { flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.7 : 1 }]}><Avatar {...item} /><View style={{ flex: 1 }}><Text style={{ fontFamily: fonts.semibold, color: colors.text, fontSize: 16 }}>{getClientFullName(item)}</Text>{!!(item.phone || item.email) && <Text style={styles.muted}>{item.phone || item.email}</Text>}</View></Pressable>} />
    <FAB label="Paciente" onPress={create} />
  </View>
}
export function PatientScreen({ route, navigation }: ScreenProps<'Client'>) {
  const state = useStore()
  const client = state.clients.find(c => c.id === route.params.id)
  const [allAppointments, setAllAppointments] = useState(false)
  useLayoutEffect(() => {
    navigation.setOptions({ title: client ? getClientFullName(client) : 'Paciente', headerRight: () => <IconButton icon={Edit} label="Editar paciente" onPress={() => navigation.navigate('ClientForm', { id: route.params.id })} /> })
  }, [client, navigation, route.params.id])
  if (!client) return <Page><Empty title="Paciente no encontrado" detail="Volvé a la lista de pacientes." /></Page>
  const appointments = state.appointments.filter(a => a.clientId === client.id).sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
  return <Page>
    <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 16 }]}><Avatar {...client} size={64} /><View style={{ flex: 1, gap: 5 }}><Text style={[styles.heading, { fontSize: 22 }]}>{getClientFullName(client)}</Text>
    {client.phone && <Pressable accessibilityRole="link" accessibilityLabel={'Llamar a ' + client.phone} onPress={() => { void Linking.openURL(`tel:${client.phone!.replace(/[^+\d]/g, '')}`).catch(() => Alert.alert('No se pudo abrir el teléfono')) }} style={styles.row}><Phone size={16} color={colors.muted} /><Text style={styles.muted}>{client.phone}</Text></Pressable>}
    {client.email && <Pressable accessibilityRole="link" accessibilityLabel={'Enviar correo a ' + client.email} onPress={() => { void Linking.openURL(`mailto:${encodeURIComponent(client.email!)}`).catch(() => Alert.alert('No se pudo abrir el correo')) }} style={styles.row}><Mail size={16} color={colors.muted} /><Text style={[styles.muted, { flex: 1 }]}>{client.email}</Text></Pressable>}
    {client.dateOfBirth && <Text style={styles.muted}>Nacimiento: {formatDate(client.dateOfBirth)}</Text>}
    </View></View>
    {!!client.notes && <View style={styles.card}><Text style={styles.label}>Historia Clínica</Text><Text style={styles.text}>{client.notes}</Text></View>}
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('PhotoForm', { clientId: client.id })} style={[styles.card, { flex: 1, minHeight: 128, alignItems: 'center', justifyContent: 'center' }]}><Camera size={28} color={colors.primary} /><Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.text }}>Fotos</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('AppointmentForm', { clientId: client.id })} style={[styles.card, { flex: 1, minHeight: 128, alignItems: 'center', justifyContent: 'center' }]}><Calendar size={28} color={colors.primary} /><Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.text }}>Cita</Text></Pressable>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <Text style={[styles.heading, { flex: 1 }]}>Historial de turnos</Text>
      {appointments.length > 2 && <Pressable accessibilityRole="button" accessibilityState={{ expanded: allAppointments }} onPress={() => setAllAppointments(!allAppointments)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, minHeight: 44, opacity: pressed ? 0.6 : 1 })}><Text style={{ fontFamily: fonts.semibold, fontSize: 12, color: colors.primary }}>Todos los turnos</Text>{allAppointments ? <ChevronUp size={16} color={colors.primary} /> : <ChevronDown size={16} color={colors.primary} />}</Pressable>}
    </View>
    {!appointments.length && <Empty title="Sin turnos" detail="Agendá la primera consulta de este paciente." />}
    {(allAppointments ? appointments : appointments.slice(0, 2)).map(appointment => <AppointmentCard key={appointment.id} appointment={appointment} onEdit={() => navigation.navigate('AppointmentForm', { appointmentId: appointment.id })} />)}
    <PatientGallery clientId={client.id} onAdd={() => navigation.navigate('PhotoForm', { clientId: client.id })} onCompare={() => navigation.navigate('Photos', { clientId: client.id })} />
  </Page>
}
export function PatientFormScreen({ route, navigation }: ScreenProps<'ClientForm'>) {
  const store = useStore()
  const id = route.params?.id
  const existing = store.clients.find(c => c.id === id)
  useLayoutEffect(() => { navigation.setOptions({ title: id ? 'Editar paciente' : 'Nuevo paciente' }) }, [id, navigation])
  const [form, setForm] = useState({ firstName: existing?.firstName || '', lastName: existing?.lastName || '', phone: existing?.phone || '', email: existing?.email || '', dateOfBirth: existing?.dateOfBirth || '', notes: existing?.notes || '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const change = (key: keyof typeof form, value: string) => setForm(previous => ({ ...previous, [key]: value }))
  if (id && !existing) return <Page><Empty title="Paciente no encontrado" detail="Volvé a la lista." /></Page>
  const save = () => {
    const next: Record<string, string> = {}
    if (!form.firstName.trim()) next.firstName = 'El nombre es requerido'
    if (!form.lastName.trim()) next.lastName = 'El apellido es requerido'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Email inválido'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    attempt(() => {
      const data = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        notes: form.notes.trim() || undefined,
      }
      if (id) { store.updateClient(id, data); navigation.goBack() }
      else {
        const client = store.addClient(data)
        if (route.params?.appointmentDate) navigation.replace('SelectPatient', { clientId: client.id, date: route.params.appointmentDate })
        else navigation.replace('Client', { id: client.id })
      }
    })
    setSaving(false)
  }
  return <Page>
    <View style={[styles.card, { gap: 16 }]}>
      <Field label="Nombre *" placeholder="Nombre" value={form.firstName} onChangeText={v => change('firstName', v)} error={errors.firstName} autoCapitalize="words" autoComplete="given-name" />
      <Field label="Apellido *" placeholder="Apellido" value={form.lastName} onChangeText={v => change('lastName', v)} error={errors.lastName} autoCapitalize="words" autoComplete="family-name" />
    </View>
    <View style={[styles.card, { gap: 16 }]}>
      <BirthDateField value={form.dateOfBirth} onChange={value => change('dateOfBirth', value)} />
      <Field label="Teléfono" placeholder="Ej: 11 1234-5678" value={form.phone} onChangeText={v => change('phone', v)} keyboardType="phone-pad" autoComplete="tel" />
      <Field label="Email" placeholder="correo@ejemplo.com" value={form.email} onChangeText={v => change('email', v)} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
    </View>
    <View style={styles.card}>
      <Field label="Historia Clínica" placeholder="Historia clínica, observaciones, antecedentes, etc." value={form.notes} onChangeText={v => change('notes', v)} multiline />
    </View>
    <Button title={saving ? 'Guardando...' : id ? 'Guardar cambios' : 'Crear paciente'} onPress={save} disabled={saving} />
    {id && <View style={{ marginTop: 16, paddingTop: 20, borderTopWidth: 1, borderTopColor: `${colors.danger}26` }}>
      <Pressable accessibilityRole="button" onPress={() => confirmDelete('Se eliminarán el paciente, sus turnos y sus fotos. Esta acción no se puede deshacer.', () => { store.deleteClient(id); navigation.popToTop() })} style={({ pressed }) => [styles.button, { backgroundColor: 'transparent', opacity: pressed ? 0.7 : 1 }]}><Text style={[styles.buttonText, { color: colors.danger }]}>Eliminar paciente</Text></Pressable>
    </View>}
  </Page>
}
