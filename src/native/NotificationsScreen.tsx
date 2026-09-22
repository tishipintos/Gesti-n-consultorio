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
import { Empty } from './ui'
import { colors, fonts, styles } from './theme'

export function NotificationsScreen() {
  const notifications = useNotifications()
  const navigation = useNavigation<NativeStackNavigationProp<RootStack>>()
  const markSeen = useNotificationReadState(s => s.markSeen)
  useFocusEffect(useCallback(() => { markSeen(notifications.map(notificationKey)) }, [notifications, markSeen]))
  const today = formatDate(new Date(), 'yyyy-MM-dd')
  const tomorrow = formatDate(addDays(new Date(), 1), 'yyyy-MM-dd')
  const sections = [
    { title: 'PAGOS PENDIENTES', icon: DollarSign, data: notifications.filter(n => n.type === 'paymentDue') },
    { title: 'HOY', icon: Clock, data: notifications.filter(n => n.date === today && !['paymentDue', 'followUp'].includes(n.type)) },
    { title: 'MAÑANA', icon: Calendar, data: notifications.filter(n => n.date === tomorrow && !['paymentDue', 'followUp'].includes(n.type)) },
    { title: 'SEGUIMIENTO', icon: Stethoscope, data: notifications.filter(n => n.type === 'followUp') },
  ].filter(s => s.data.length)
  return <View style={styles.page}><SectionList contentContainerStyle={styles.content} sections={sections} keyExtractor={n => n.id} stickySectionHeadersEnabled={false}
    ListEmptyComponent={<Empty icon={Bell} title="Sin notificaciones" detail="Las notificaciones se generan automáticamente según los turnos y pacientes" />}
    renderSectionHeader={({ section }) => <View style={[styles.row, { marginTop: 8 }]}><section.icon size={14} color={section.title === 'PAGOS PENDIENTES' ? colors.danger : colors.primary} /><Text style={[styles.label, { fontSize: 12 }]}>{section.title}</Text></View>}
    renderItem={({ item, section }) => {
      const payment = item.type === 'paymentDue'
      return <Pressable accessibilityRole="button" accessibilityLabel={item.clientName + ': ' + item.title} onPress={() => navigation.navigate('Client', { id: item.clientId })} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, backgroundColor: payment ? '#FFF1F2' : '#EDF5FF', opacity: pressed ? 0.7 : 1 })}>
        <View style={{ width: 40, height: 40, backgroundColor: payment ? '#FFE4E6' : '#DCEAFF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><section.icon size={20} color={payment ? '#BE123C' : '#416DA3'} /></View>
        <View style={{ flex: 1, gap: 4 }}><Text style={{ fontFamily: fonts.bold, fontSize: 14, color: payment ? '#9F1239' : colors.text }}>{item.clientName}</Text><Text style={{ fontFamily: fonts.medium, fontSize: 13, color: payment ? '#9F1239' : colors.text }}>{item.title}</Text><Text style={{ fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: payment ? '#9D374D' : colors.muted }}>{item.subtitle}</Text></View>
      </Pressable>
    }} />
  </View>
}
