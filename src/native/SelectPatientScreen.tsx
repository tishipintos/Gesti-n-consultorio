import { useState } from 'react'
import { Keyboard, Pressable, Text, TextInput, View } from 'react-native'
import { ChevronRight, Search } from 'lucide-react-native'
import { useStore } from '../store'
import { getClientFullName } from '../utils'
import { Avatar } from './chrome'
import type { ScreenProps } from './navigation'
import { Button, Page } from './ui'
import { colors, fonts, styles } from './theme'

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim()

export function SelectPatientScreen({ route, navigation }: ScreenProps<'SelectPatient'>) {
  const clients = useStore(state => state.clients)
  const [search, setSearch] = useState('')
  const query = normalize(search)
  const matches = clients.filter(client => normalize([getClientFullName(client), client.phone, client.email].filter(Boolean).join(' ')).includes(query))

  const select = (clientId: string) => {
    Keyboard.dismiss()
    navigation.navigate('AppointmentForm', { clientId, date: route.params.date, fromAgenda: true })
  }

  return <Page activeTab="Agenda">
    <Text style={styles.title}>¿Para quién es el turno?</Text>
    <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
      <Search size={22} color={colors.muted} />
      <TextInput
        accessibilityLabel="Buscar clientes por nombre, teléfono o email"
        placeholder="Buscar cliente..."
        placeholderTextColor={colors.muted}
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
        returnKeyType="search"
        style={{ flex: 1, minHeight: 32, padding: 0, fontFamily: fonts.regular, fontSize: 16, color: colors.text }}
      />
    </View>
    <Text accessibilityLiveRegion="polite" style={styles.muted}>{matches.length} {matches.length === 1 ? 'cliente' : 'clientes'}</Text>
    {matches.length > 0 && <View style={[styles.card, { gap: 0, paddingVertical: 0 }]}>
      {matches.map((client, index) => <Pressable
        key={client.id}
        accessibilityRole="button"
        accessibilityLabel={'Agendar turno para ' + getClientFullName(client)}
        onPress={() => select(client.id)}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 76, paddingVertical: 12, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: '#F0EDE5', opacity: pressed ? 0.65 : 1 })}
      >
        <Avatar {...client} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: fonts.semibold, fontSize: 16, color: colors.text }}>{getClientFullName(client)}</Text>
          {!!(client.phone || client.email) && <Text style={styles.muted}>{client.phone || client.email}</Text>}
        </View>
        <ChevronRight size={20} color={colors.primary} />
      </Pressable>)}
    </View>}
    {matches.length === 0 && <Text style={styles.muted}>{clients.length ? 'No encontramos clientes con esos datos. Probá con otro nombre o teléfono.' : 'Agregá tu primer cliente para poder agendar un turno.'}</Text>}
    <Button title="Agregar cliente" onPress={() => { Keyboard.dismiss(); navigation.navigate('ClientForm', { appointmentDate: route.params.date }) }} />
  </Page>
}
