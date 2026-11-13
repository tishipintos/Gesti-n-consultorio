import { usePageGeometry } from './usePageGeometry'
import { useCallback } from 'react'
import { Pressable, SectionList, Text, View } from 'react-native'
import { Bell, Calendar, Clock, DollarSign, Stethoscope } from 'lucide-react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { addDays } from 'date-fns'
import { formatDate } from '../utils'
import { useNotifications } from '../hooks/useNotifications'
import { notificationKey, useNotificationReadState } from '../store/notificationReadState'
import type { RootStack } from './navigation'
import { AppHeader } from './chrome'
import { Empty } from './ui'
import { notificationDisplay } from '../utils/notificationDisplay'
import { colors, fonts, styles } from './theme'

export function NotificationsScreen() {
  const { frame } = usePageGeometry('notices')
  const notifications = useNotifications()
  const navigation = useNavigation<NativeStackNavigationProp<RootStack>>()
  const markSeen = useNotificationReadState(s => s.markSeen)
  useFocusEffect(useCallback(() => { markSeen(notifications.map(notificationKey)) }, [notifications, markSeen]))
  const today = formatDate(new Date(), 'yyyy-MM-dd')
  const tomorrow = formatDate(addDays(new Date(), 1), 'yyyy-MM-dd')
  const sections = [
    { color: '#B54852', title: 'Pagos pendientes', icon: DollarSign, data: notifications.filter(n => n.type === 'paymentDue') },
    { color: '#916800', title: 'Hoy', icon: Clock, data: notifications.filter(n => n.date === today && !['paymentDue', 'followUp'].includes(n.type)) },
    { color: '#92682F', title: 'Mañana', icon: Calendar, data: notifications.filter(n => n.date === tomorrow && !['paymentDue', 'followUp'].includes(n.type)) },
    { color: '#966010', title: 'Seguimiento', icon: Stethoscope, data: notifications.filter(n => n.type === 'followUp') },
  ].filter(s => s.data.length)
  return <View style={styles.page}><AppHeader title="Notificaciones" subtitle={notifications.length ? notifications.length + ' activas' : undefined} /><SectionList contentContainerStyle={[styles.content, { gap: 8, ...frame }, !notifications.length && { flexGrow: 1, justifyContent: 'center' }]} sections={sections} keyExtractor={n => n.id} stickySectionHeadersEnabled={false}
    ListEmptyComponent={<Empty icon={Bell} title="Sin notificaciones" detail="Las notificaciones se generan automáticamente según los turnos y pacientes" />}
    renderSectionHeader={({ section }) => <View style={[styles.row, { marginTop: 24, marginBottom: 8 }]}><section.icon size={16} color={section.color} /><Text accessibilityRole="header" style={styles.heading}>{section.title}</Text></View>}
    renderItem={({ item }) => {
      const display = notificationDisplay(item)
      return <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Client', { id: item.clientId })} style={({ pressed }) => [styles.listRow, { paddingVertical: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: pressed ? colors.soft : 'transparent' }]}>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}><Text style={[styles.text, { fontFamily: fonts.semibold }]}>{display.title}</Text><Text style={styles.muted}>{display.description}</Text></View>
      </Pressable>
    }} />
  </View>
}
