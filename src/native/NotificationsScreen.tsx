import { useCallback } from 'react'
import { FlatList, Text, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNotifications } from '../hooks/useNotifications'
import { notificationKey, useNotificationReadState } from '../store/notificationReadState'
import type { RootStack } from './navigation'
import { Button, Empty } from './ui'
import { styles } from './theme'

export function NotificationsScreen() {
  const notifications = useNotifications()
  const navigation = useNavigation<NativeStackNavigationProp<RootStack>>()
  const markSeen = useNotificationReadState(s => s.markSeen)
  useFocusEffect(useCallback(() => { markSeen(notifications.map(notificationKey)) }, [notifications, markSeen]))
  return <View style={styles.page}><FlatList contentContainerStyle={styles.content} data={notifications} keyExtractor={n => n.id} ListHeaderComponent={<><Text style={styles.title}>Recordatorios</Text><Text style={styles.muted}>Turnos, controles y pagos pendientes. Se actualizan al abrir la app.</Text></>} ListEmptyComponent={<Empty title="Todo al día" detail="Los recordatorios aparecerán según los turnos que registres." />} renderItem={({ item }) => <View style={styles.card}><Text style={styles.heading}>{item.title}</Text><Text style={styles.text}>{item.clientName}</Text><Text style={styles.muted}>{item.subtitle}</Text><Button secondary title="Ver paciente" onPress={() => navigation.navigate('Client', { id: item.clientId })} /></View>} /></View>
}
