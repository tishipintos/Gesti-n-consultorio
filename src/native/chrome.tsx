import type { ReactNode } from 'react'
import { Pressable, Text, View, StyleSheet } from 'react-native'
import { Bell, Calendar, ChevronLeft, Plus, Users } from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStack } from './navigation'
import { colors, fonts, shadow } from './theme'
import { useNotifications } from '../hooks/useNotifications'
import { notificationKey, useNotificationReadState } from '../store/notificationReadState'
import { useKeyboardVisible } from './useKeyboardVisible'

const tabs = [{ name: 'Agenda', label: 'Calendario', icon: Calendar }, { name: 'Pacientes', label: 'Pacientes', icon: Users }, { name: 'Recordatorios', label: 'Notificaciones', icon: Bell }] as const
export function IconButton({ icon: Icon, label, onPress, color = colors.primary }: { icon: LucideIcon; label: string; onPress: () => void; color?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}><Icon size={22} color={color} strokeWidth={2} /></Pressable>
}
export function AppHeader({ title, subtitle, back, right }: { title: string; subtitle?: string; back?: () => void; right?: ReactNode }) {
  const insets = useSafeAreaInsets()
  return <View style={{ paddingTop: insets.top, backgroundColor: colors.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E8E2D6' }}><View style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, width: '100%', maxWidth: 512, alignSelf: 'center' }}>
    <View style={{ width: 44 }}>{back && <IconButton icon={ChevronLeft} label="Volver" onPress={back} />}</View>
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}><Text numberOfLines={1} style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.text }}>{title}</Text>{subtitle && <Text style={{ fontFamily: fonts.regular, color: colors.muted, fontSize: 12 }}>{subtitle}</Text>}</View>
    <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{right}</View>
  </View></View>
}
export function BottomNav({ active, onSelect }: { active: string; onSelect?: (name: 'Agenda' | 'Pacientes' | 'Recordatorios') => void }) {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NativeStackNavigationProp<RootStack>>()
  const seen = useNotificationReadState(s => s.seen)
  const notifications = useNotifications()
  const unread = notifications.some(n => !seen.includes(notificationKey(n)))
  const keyboardOpen = useKeyboardVisible()
  if (keyboardOpen) return null
  return <View pointerEvents="box-none" style={{ position: 'absolute', bottom: Math.max(insets.bottom, 12), left: 12, right: 12, alignItems: 'center' }}>
    <View style={{ backgroundColor: colors.surface, borderRadius: 22, padding: 8, flexDirection: 'row', gap: 6, maxWidth: 512, width: '100%', ...shadow, shadowOpacity: 0.16 }}>
      {tabs.map(({ name, label, icon: Icon }) => <Pressable key={name} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: active === name }} onPress={() => onSelect ? onSelect(name) : navigation.popTo('Home', { screen: name })} style={({ pressed }) => ({ flex: 1, minHeight: 56, paddingVertical: 6, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: active === name ? '#F2ECDB' : 'transparent', opacity: pressed ? 0.6 : 1 })}>
        <View><Icon size={24} strokeWidth={active === name ? 2.2 : 1.5} color={active === name ? colors.primary : colors.muted} />{name === 'Recordatorios' && unread && <View style={{ position: 'absolute', right: -3, top: -1, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.danger }} />}</View>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 11, color: active === name ? colors.primary : colors.muted }}>{label}</Text>
      </Pressable>)}
    </View>
  </View>
}
export function FAB({ label, onPress }: { label: string; onPress: () => void }) {
  const insets = useSafeAreaInsets()
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({ position: 'absolute', bottom: Math.max(insets.bottom, 12) + 92, right: 20, backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 24, minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, ...shadow, shadowOpacity: 0.18, opacity: pressed ? 0.7 : 1 })}><Plus color="white" size={24} /><Text style={{ color: 'white', fontSize: 14, fontFamily: fonts.semibold }}>{label}</Text></Pressable>
}
export function Avatar({ firstName, lastName, id, size = 48 }: { firstName: string; lastName: string; id: string; size?: number }) {
  const palette = [colors.primary, '#92682F', colors.primary, colors.success, '#966010', colors.danger]
  const color = palette[[...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length]
  return <View accessibilityLabel={`${firstName} ${lastName}`} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, borderWidth: 2, borderColor: '#FFFFFFCC', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontFamily: fonts.bold, fontSize: size * 0.29 }}>{firstName[0]}{lastName[0]}</Text></View>
}
