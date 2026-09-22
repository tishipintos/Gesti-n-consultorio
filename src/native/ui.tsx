import { useState } from 'react'
import type { PropsWithChildren } from 'react'
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import type { TextInputProps } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, styles } from './theme'
import { formatDate } from '../utils'
import { Clock, ChevronDown } from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { BottomNav } from './chrome'
import { useKeyboardVisible } from './useKeyboardVisible'

export function Page({ children, activeTab = 'Pacientes' }: PropsWithChildren<{ activeTab?: 'Agenda' | 'Pacientes' | 'Recordatorios' }>) {
  const insets = useSafeAreaInsets()
  const keyboardOpen = useKeyboardVisible()
  return <View style={styles.page}>
    <ScrollView
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={[styles.content, { paddingBottom: keyboardOpen ? 24 : 124 + insets.bottom }]}
    >{children}</ScrollView>
    <BottomNav active={activeTab} />
  </View>
}
export function Button({ title, onPress, secondary, danger, disabled }: { title: string; onPress: () => void; secondary?: boolean; danger?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }, danger && { backgroundColor: colors.danger }, { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}>
    <Text style={[styles.buttonText, secondary && !danger && { color: colors.text }]}>{title}</Text>
  </Pressable>
}
export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return <View style={{ gap: 6 }}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} {...props} style={[styles.input, props.multiline && { minHeight: 110, textAlignVertical: 'top' }, error && { borderColor: colors.danger }, props.style]} />{error && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text>}</View>
}
export function Choices<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void }) {
  return <View style={{ gap: 8 }}><Text style={styles.text}>{label}</Text><View style={styles.row}>{options.map(option => <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: value === option.value }} onPress={() => onChange(option.value)} style={[styles.button, { backgroundColor: value === option.value ? colors.primary : colors.tint }]}><Text style={[styles.buttonText, value !== option.value && { color: colors.text }]}>{option.label}</Text></Pressable>)}</View></View>
}
export function DateField({ label, value, onChange, mode = 'date', maximumDate }: { label: string; value: Date; onChange: (value: Date) => void; mode?: 'date' | 'time'; maximumDate?: Date }) {
  const [open, setOpen] = useState(false)
  if (Platform.OS === 'ios') return <View style={{ gap: 8 }}><Text style={styles.label}>{label}</Text><DateTimePicker accessibilityLabel={label} value={value} mode={mode} maximumDate={maximumDate} display="compact" themeVariant="light" style={{ minHeight: 48 }} onChange={(event, date) => { if (event.type === 'set' && date) onChange(date) }} /></View>
  return <View style={{ gap: 8 }}><Text style={styles.text}>{label}</Text><Button secondary title={formatDate(value, mode === 'time' ? 'HH:mm' : 'dd/MM/yyyy')} onPress={() => setOpen(!open)} />{open && <DateTimePicker value={value} mode={mode} maximumDate={maximumDate} display="default" themeVariant="light" onChange={(event, date) => { setOpen(false); if (event.type === 'set' && date) onChange(date) }} />}</View>
}
export function Empty({ title, detail, icon: Icon = Clock, action }: { title: string; detail: string; icon?: LucideIcon; action?: { title: string; onPress: () => void } }) {
  return <View style={{ paddingTop: 48, paddingBottom: 80, paddingHorizontal: 24, alignItems: 'center', gap: 12 }}>
    <View style={{ width: 80, height: 80, backgroundColor: colors.soft, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}><Icon size={44} color={colors.primary} strokeWidth={1.5} /></View>
    <Text style={[styles.heading, { textAlign: 'center' }]}>{title}</Text><Text style={[styles.muted, { textAlign: 'center', maxWidth: 320, marginBottom: 12 }]}>{detail}</Text>
    {action && <Button title={action.title} onPress={action.onPress} />}
  </View>
}

export function SelectField({ label, value, options, onChange, maxOptionsHeight, placeholder = 'Seleccioná una opción' }: { label: string; value: string; options: readonly { value: string; label: string; disabled?: boolean }[]; onChange: (value: string) => void; maxOptionsHeight?: number; placeholder?: string }) {
  const [open, setOpen] = useState(false)
  return <View style={{ gap: 8 }}><Text style={styles.label}>{label}</Text><Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}><Text style={[styles.text, { flex: 1 }]}>{options.find(o => o.value === value)?.label || placeholder}</Text><ChevronDown size={20} color={colors.muted} /></Pressable>
    {open && <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: maxOptionsHeight, backgroundColor: colors.surface, borderRadius: 12 }} contentContainerStyle={{ padding: 4 }} >{options.map(option => <Pressable accessibilityRole="radio" accessibilityState={{ checked: value === option.value, disabled: !!option.disabled }} disabled={option.disabled} key={option.value} onPress={() => { onChange(option.value); setOpen(false) }} style={({ pressed }) => ({ padding: 12, minHeight: 48, backgroundColor: value === option.value ? colors.soft : colors.surface, borderRadius: 8, opacity: option.disabled ? 0.4 : pressed ? 0.7 : 1 })}><Text style={styles.text}>{option.label}</Text></Pressable>)}</ScrollView>}
  </View>
}
