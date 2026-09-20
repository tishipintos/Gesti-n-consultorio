import { useState } from 'react'
import type { PropsWithChildren } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import type { TextInputProps } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useHeaderHeight } from '@react-navigation/elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, styles } from './theme'
import { formatDate } from '../utils'

export function Page({ children }: PropsWithChildren) {
  const headerHeight = useHeaderHeight()
  const insets = useSafeAreaInsets()
  return <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={headerHeight}>
    <ScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}>{children}</ScrollView>
  </KeyboardAvoidingView>
}
export function Button({ title, onPress, secondary, danger, disabled }: { title: string; onPress: () => void; secondary?: boolean; danger?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && { backgroundColor: colors.tint }, danger && { backgroundColor: colors.danger }, { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}>
    <Text style={[styles.buttonText, secondary && !danger && { color: colors.text }]}>{title}</Text>
  </Pressable>
}
export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return <View style={{ gap: 6 }}><Text style={styles.text}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} {...props} style={[styles.input, props.multiline && { minHeight: 110, textAlignVertical: 'top' }, error && { borderColor: colors.danger }, props.style]} />{error && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text>}</View>
}
export function Choices<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void }) {
  return <View style={{ gap: 8 }}><Text style={styles.text}>{label}</Text><View style={styles.row}>{options.map(option => <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: value === option.value }} onPress={() => onChange(option.value)} style={[styles.button, { backgroundColor: value === option.value ? colors.primary : colors.tint }]}><Text style={[styles.buttonText, value !== option.value && { color: colors.text }]}>{option.label}</Text></Pressable>)}</View></View>
}
export function DateField({ label, value, onChange, mode = 'date', maximumDate }: { label: string; value: Date; onChange: (value: Date) => void; mode?: 'date' | 'time'; maximumDate?: Date }) {
  const [open, setOpen] = useState(false)
  return <View style={{ gap: 8 }}><Text style={styles.text}>{label}</Text><Button secondary title={formatDate(value, mode === 'time' ? 'HH:mm' : 'dd/MM/yyyy')} onPress={() => setOpen(!open)} />{open && <DateTimePicker value={value} mode={mode} maximumDate={maximumDate} display={Platform.OS === 'ios' ? 'spinner' : 'default'} themeVariant="light" onChange={(event, date) => { if (Platform.OS !== 'ios') setOpen(false); if (event.type === 'set' && date) onChange(date) }} />}{open && Platform.OS === 'ios' && <Button secondary title="Listo" onPress={() => setOpen(false)} />}</View>
}
export function Empty({ title, detail }: { title: string; detail: string }) { return <View style={{ paddingVertical: 28, gap: 10 }}><Text style={styles.heading}>{title}</Text><Text style={styles.muted}>{detail}</Text></View> }
