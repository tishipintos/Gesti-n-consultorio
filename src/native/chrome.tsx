import { AppointmentIcon } from '../components/AppointmentIcon'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AccessibilityInfo, Platform, Pressable, Text, View, StyleSheet } from 'react-native'
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect'
import { Bell, Calendar, ChevronLeft, Plus, Users, UserRound } from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useIsFocused } from '@react-navigation/native'
import type { MainTabs } from './navigation'
import { colors, fonts, shadow } from './theme'
import { useNotifications } from '../hooks/useNotifications'
import { notificationKey, useNotificationReadState } from '../store/notificationReadState'
import { usePageGeometry } from './usePageGeometry'
import { useKeyboardVisible } from './useKeyboardVisible'

const tabs = [{ name: 'Agenda', label: 'Calendario', icon: Calendar }, { name: 'Pacientes', label: 'Pacientes', icon: Users }, { name: 'Recordatorios', label: 'Avisos', icon: Bell }, { name: 'Perfil', label: 'Perfil', icon: UserRound }] as const
export function IconButton({ icon: Icon, label, onPress, color = colors.primary }: { icon: LucideIcon; label: string; onPress: () => void; color?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: pressed ? colors.tint : 'transparent' })}><Icon size={22} color={color} strokeWidth={1.75} /></Pressable>
}
export function AppHeader({ title, subtitle, back, right }: { title: string; subtitle?: string; back?: () => void; right?: ReactNode }) {
  const insets = useSafeAreaInsets()
  const { frame } = usePageGeometry(title === 'Agenda' ? 'agenda' : title === 'Notificaciones' ? 'notices' : 'reading')
  return <View style={{ paddingTop: insets.top, backgroundColor: colors.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.edge }}><View style={{ minHeight: back ? 56 : 88, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, ...frame }}>
    {back && <View style={{ marginLeft: -12 }}><IconButton icon={ChevronLeft} label="Volver" onPress={back} /></View>}
    <View style={{ flex: 1, paddingVertical: back ? 8 : 16, gap: 4 }}><Text accessibilityRole="header" numberOfLines={2} style={{ fontFamily: fonts.semibold, fontSize: back ? 18 : 28, letterSpacing: back ? -0.3 : -0.7, color: colors.text }}>{title}</Text>{subtitle && <Text style={{ fontFamily: fonts.regular, color: colors.muted, fontSize: 13 }}>{subtitle}</Text>}</View>
    {right && <View style={{ alignItems: 'flex-end' }}>{right}</View>}
  </View></View>
}
const supportsGlass = Platform.OS === 'ios' && isGlassEffectAPIAvailable() && isLiquidGlassAvailable()

function useNavGlass() {
  const [reduceTransparency, setReduceTransparency] = useState(true)
  useEffect(() => {
    if (!supportsGlass) return
    let current = true
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', value => {
      current = false
      setReduceTransparency(value)
    })
    void AccessibilityInfo.isReduceTransparencyEnabled().then(value => {
      if (current) setReduceTransparency(value)
    }).catch(() => {})
    return () => {
      current = false
      subscription.remove()
    }
  }, [])
  return supportsGlass && !reduceTransparency
}

export function BottomNav({ active, onSelect, visible = true }: { active: string; onSelect: (name: keyof MainTabs) => void; visible?: boolean }) {
  const insets = useSafeAreaInsets()
  const seen = useNotificationReadState(s => s.seen)
  const notifications = useNotifications()
  const unread = notifications.some(n => !seen.includes(notificationKey(n)))
  const keyboardOpen = useKeyboardVisible()
  const useGlass = useNavGlass()
  const hidden = keyboardOpen || !visible
  return <View pointerEvents={hidden ? 'none' : 'box-none'} accessibilityElementsHidden={hidden} importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'} style={{ opacity: hidden ? 0 : 1, position: 'absolute', bottom: Math.max(insets.bottom, 12), left: insets.left + 12, right: insets.right + 12, alignItems: 'center' }}>
    <View accessibilityRole="tablist" style={[navStyles.capsule, !useGlass && navStyles.opaque]}>
      {useGlass && <GlassView pointerEvents="none" accessible={false} glassEffectStyle="regular" tintColor="#FFF4DEAA" style={navStyles.glass} />}
      {tabs.map(({ name, label, icon: Icon }) => <Pressable key={name} accessibilityRole="tab" accessibilityLabel={name === 'Recordatorios' ? (unread ? 'Avisos de notificaciones sin abrir' : 'Avisos de notificaciones') : label} accessibilityState={{ selected: active === name }} onPress={() => onSelect(name)} style={({ pressed }) => [navStyles.tab, active === name && navStyles.activeTab, pressed && navStyles.pressedTab]}>
        <View><Icon size={24} strokeWidth={active === name ? 2.2 : 1.5} color={active === name ? colors.primary : colors.muted} />{name === 'Recordatorios' && unread && <View style={{ position: 'absolute', right: -3, top: -1, width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: colors.surface, backgroundColor: colors.danger }} />}</View>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 11, textAlign: 'center', color: active === name ? colors.primary : colors.muted }}>{label}</Text>
      </Pressable>)}
    </View>
  </View>
}
const navStyles = StyleSheet.create({
  capsule: {
    ...shadow,
    shadowOpacity: 0.14,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.surface,
    borderBottomColor: colors.border,
    padding: 7,
    flexDirection: 'row',
    gap: 4,
    maxWidth: 512,
    width: '100%',
  },
  glass: { ...StyleSheet.absoluteFill, borderRadius: 39 },
  opaque: { backgroundColor: '#FFFAF0' },
  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    paddingVertical: 6,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  activeTab: { backgroundColor: '#F1E4C4', borderColor: 'transparent' },
  pressedTab: { backgroundColor: '#E8DBB8' },
})

export function FAB({ label, onPress, agenda }: { label: string; onPress: () => void; agenda?: boolean }) {
  const focused = useIsFocused()
  const insets = useSafeAreaInsets()
  const { rightGutter } = usePageGeometry(agenda ? 'agenda' : 'reading')
  const keyboardOpen = useKeyboardVisible()
  if (keyboardOpen || !focused) return null
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({ position: 'absolute', bottom: Math.max(insets.bottom, 12) + 100, right: rightGutter, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 20, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, ...shadow, opacity: pressed ? 0.7 : 1 })}>{agenda ? <AppointmentIcon size={20} /> : <Plus color="white" size={20} strokeWidth={1.75} />}<Text style={{ color: 'white', fontSize: 14, fontFamily: fonts.semibold }}>{label}</Text></Pressable>
}
export function Avatar({ firstName, lastName, size = 48 }: { firstName: string; lastName: string; id: string; size?: number }) {
  return <View accessibilityLabel={`${firstName} ${lastName}`} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.primary, fontFamily: fonts.semibold, fontSize: size * 0.29 }}>{firstName[0]}{lastName[0]}</Text></View>
}
