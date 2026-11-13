import { usePageGeometry } from './usePageGeometry'
import { ChevronRight } from 'lucide-react-native'
import { useStore } from '../store'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useProfile } from '../hooks/useProfile'
import { appointmentAttribution, profileName, profileOptions, profileSections } from '../utils/profiles'
import { formatDate, getClientFullName } from '../utils'
import { attempt } from './actions'
import type { RootStack, ScreenProps } from './navigation'
import { Choices, Page } from './ui'
import { colors, fonts, styles } from './theme'

export function ProfileScreen() {
  const activeProfile = useStore(s => s.activeProfile)
  const setActiveProfile = useStore(s => s.setActiveProfile)
  const navigation = useNavigation<NativeStackNavigationProp<RootStack>>()
  const { frame } = usePageGeometry()
  return <ScrollView style={styles.page} contentContainerStyle={[styles.content, { ...frame }]}>
    <View style={{ gap: 20, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text accessibilityRole="header" style={styles.title}>{profileName(activeProfile)}</Text>
      <Choices label="Cambiar perfil" value={activeProfile} options={profileOptions} onChange={profile => attempt(() => setActiveProfile(profile))} />
    </View>
    <View>{Object.entries(profileSections).map(([key, section]) => <Pressable
      key={key}
      accessibilityRole="button"
      onPress={() => navigation.navigate('ProfileSection', { section: key as keyof typeof profileSections })}
      style={({ pressed }) => [styles.listRow, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, backgroundColor: pressed ? colors.soft : 'transparent' }]}
    >
      <Text style={[styles.text, { flex: 1, fontFamily: fonts.medium }]}>{section.title}</Text>
      <ChevronRight size={18} color={colors.muted} />
    </Pressable>)}</View>
  </ScrollView>
}

export function ProfileSectionScreen({ route, navigation }: ScreenProps<'ProfileSection'>) {
  const { section } = route.params
  const lists = useProfile()
  const { empty } = profileSections[section]

  return <Page>
    {!lists[section].length && <Text style={styles.muted}>{empty}</Text>}
    <View>{section === 'followUps'
      ? lists.followUps.map(item => <Pressable key={item.id} accessibilityRole="button" style={({ pressed }) => [styles.listRow, { backgroundColor: pressed ? colors.soft : 'transparent' }]} onPress={() => navigation.navigate('Client', { id: item.clientId })}>
        <Text style={[styles.text, { fontFamily: fonts.semibold }]}>{item.clientName}</Text>
        <Text style={styles.text}>{item.title}</Text>
        <Text style={styles.muted}>{formatDate(item.date)}</Text>
      </Pressable>)
      : lists[section].map(item => {
        const client = lists.clients.find(c => c.id === item.clientId)
        if (!client) return null
        return <Pressable key={item.id} accessibilityRole="button" style={({ pressed }) => [styles.listRow, { backgroundColor: pressed ? colors.soft : 'transparent' }]} onPress={() => navigation.navigate('AppointmentForm', { appointmentId: item.id, fromProfile: true })}>
          <Text style={[styles.text, { fontFamily: fonts.semibold }]}>{getClientFullName(client)}</Text>
          <Text style={styles.text}>{formatDate(item.date)} · {item.time} · {item.procedure || 'Consulta'}</Text>
          <Text style={styles.muted}>{appointmentAttribution(item)}</Text>
        </Pressable>
      })}</View>
  </Page>
}
