import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { addMonths, isSameDay, isSameMonth, startOfMonth } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { formatDate, getMonthDays } from '../utils'
import { IconButton } from './chrome'
import { colors, fonts } from './theme'

const weekdayLabels = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

export function AppointmentDatePicker({ selected, onSelect, appointmentDates }: { selected: Date; onSelect: (date: Date) => void; appointmentDates: ReadonlySet<string> }) {
  const [month, setMonth] = useState(() => startOfMonth(selected))
  const days = getMonthDays(month)
  const weeks = Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7))

  return <View style={{ padding: 8, gap: 2, borderRadius: 12, backgroundColor: '#FBF9F4' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <IconButton icon={ChevronLeft} label="Mes anterior" color={colors.muted} onPress={() => setMonth(addMonths(month, -1))} />
      <Text style={{ flex: 1, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 16, color: colors.text, textTransform: 'capitalize' }}>{formatDate(month, 'MMMM yyyy')}</Text>
      <IconButton icon={ChevronRight} label="Mes siguiente" color={colors.muted} onPress={() => setMonth(addMonths(month, 1))} />
    </View>
    <View style={{ flexDirection: 'row', gap: 2, marginBottom: 4 }}>
      {weekdayLabels.map(label => <Text key={label} style={{ flex: 1, minWidth: 0, textAlign: 'center', paddingVertical: 4, fontFamily: fonts.medium, fontSize: 14, color: colors.muted }}>{label}</Text>)}
    </View>
    {weeks.map(week => <View key={formatDate(week[0], 'yyyy-MM-dd')} style={{ flexDirection: 'row', gap: 2 }}>
      {week.map(day => {
        const key = formatDate(day, 'yyyy-MM-dd')
        const active = isSameDay(selected, day)
        const today = isSameDay(new Date(), day)
        const disabled = !isSameMonth(day, month)
        const hasAppointment = appointmentDates.has(key)
        return <Pressable
          key={key}
          accessibilityRole="button"
          accessibilityLabel={`${formatDate(day, 'd MMMM yyyy')}${active ? ', seleccionado' : ''}${hasAppointment ? ', con turnos' : ''}`}
          accessibilityState={{ selected: active, disabled }}
          disabled={disabled}
          onPress={() => onSelect(day)}
          style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: active ? colors.primary : today ? colors.soft : 'transparent', opacity: pressed ? 0.65 : 1 })}
        >
          <Text style={{ fontFamily: active || today ? fonts.semibold : fonts.regular, fontSize: 16, color: disabled ? '#ACA79A' : active ? '#FFFFFF' : today ? colors.primary : colors.text }}>{day.getDate()}</Text>
          {hasAppointment && <View style={{ position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: active ? '#FFFFFFCC' : colors.primary }} />}
        </Pressable>
      })}
    </View>)}
  </View>
}
