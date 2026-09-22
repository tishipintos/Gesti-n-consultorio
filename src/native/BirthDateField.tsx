import { useState } from 'react'
import { Keyboard, Platform, Pressable, Text, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Calendar, X } from 'lucide-react-native'
import { formatDate } from '../utils'
import { Button } from './ui'
import { colors, styles } from './theme'

export function BirthDateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(new Date())
  const displayValue = value ? formatDate(new Date(`${value}T12:00:00`), 'dd/MM/yyyy') : 'dd/mm/aaaa'
  const close = () => setOpen(false)
  const clear = () => { onChange(''); close() }
  const showPicker = () => {
    Keyboard.dismiss()
    setDraft(value ? new Date(`${value}T12:00:00`) : new Date())
    setOpen(true)
  }

  return <View style={{ gap: 6 }}>
    <Text style={styles.label}>Fecha de nacimiento</Text>
    <View style={[styles.input, { padding: 0, flexDirection: 'row', alignItems: 'center' }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Fecha de nacimiento" accessibilityValue={{ text: value ? displayValue : 'Sin fecha' }} accessibilityHint="Abre el selector de fecha" accessibilityState={{ expanded: open }} onPress={showPicker} style={({ pressed }) => ({ flex: 1, minHeight: 48, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.7 : 1 })}>
        <Text style={[styles.text, { flex: 1, color: value ? colors.text : colors.muted }]}>{displayValue}</Text>
        <Calendar size={20} color={colors.muted} />
      </Pressable>
      {!!value && <Pressable accessibilityRole="button" accessibilityLabel="Borrar fecha de nacimiento" onPress={clear} style={({ pressed }) => ({ width: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}><X size={18} color={colors.muted} /></Pressable>}
    </View>
    {open && <DateTimePicker
      accessibilityLabel="Elegir fecha de nacimiento"
      value={draft}
      mode="date"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      themeVariant="light"
      locale="es"
      positiveButton={{ label: 'Confirmar' }}
      negativeButton={{ label: 'Cancelar' }}
      neutralButton={value ? { label: 'Borrar' } : undefined}
      onValueChange={(_event, date) => {
        setDraft(date)
        if (Platform.OS !== 'ios') { onChange(formatDate(date, 'yyyy-MM-dd')); close() }
      }}
      onDismiss={close}
      onNeutralButtonPress={clear}
    />}
    {open && Platform.OS === 'ios' && <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ flex: 1 }}><Button secondary title="Cancelar" onPress={close} /></View>
      <View style={{ flex: 1 }}><Button title="Confirmar" onPress={() => { onChange(formatDate(draft, 'yyyy-MM-dd')); close() }} /></View>
    </View>}
  </View>
}
