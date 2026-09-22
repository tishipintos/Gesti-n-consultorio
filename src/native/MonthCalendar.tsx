import { Pressable, Text, View } from 'react-native'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { addMonths, isSameDay, isSameMonth } from 'date-fns'
import { formatDate, getMonthDays } from '../utils'
import { IconButton } from './chrome'
import { colors, fonts, styles } from './theme'

export function MonthCalendar({ month, selected, onMonth, onSelect, counts = {} }: { month: Date; selected: Date; onMonth: (date: Date) => void; onSelect: (date: Date) => void; counts?: Record<string, number> }) {
  const days = getMonthDays(month)
  const weeks = Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7))
  const now = new Date()

  return <View style={[styles.card, { padding: 12, gap: 4 }]}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <IconButton icon={ChevronLeft} label="Mes anterior" onPress={() => onMonth(addMonths(month, -1))} />
      <View style={{ alignItems: 'center' }}><Text style={{ fontFamily: fonts.extra, fontSize: 16, color: colors.text, textTransform: 'capitalize' }}>{formatDate(month, 'MMMM yyyy')}</Text><Pressable onPress={() => { const now = new Date(); onMonth(now); onSelect(now) }} accessibilityRole="button" hitSlop={8} style={{ padding: 8 }}><Text style={{ color: colors.primary, fontSize: 12, fontFamily: fonts.bold }}>Ir a hoy</Text></Pressable></View>
      <IconButton icon={ChevronRight} label="Mes siguiente" onPress={() => onMonth(addMonths(month, 1))} />
    </View>
    <View style={{ flexDirection: 'row' }}>{['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => <Text key={day} style={{ flex: 1, minWidth: 0, textAlign: 'center', color: colors.muted, fontFamily: fonts.semibold, fontSize: 11, paddingBottom: 10 }}>{day.toUpperCase()}</Text>)}</View>
    {/* Explicit weeks keep seven columns even when native layout rounds fractional widths. */}
    <View>{weeks.map(week => <View key={formatDate(week[0], 'yyyy-MM-dd')} style={{ flexDirection: 'row' }}>{week.map(day => {
      const key = formatDate(day, 'yyyy-MM-dd'), active = isSameDay(day, selected), today = isSameDay(day, now), inMonth = isSameMonth(day, month)
      return <View key={key} style={{ flex: 1, minWidth: 0, padding: 2 }}><Pressable accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={`${formatDate(day, 'EEEE d MMMM')}, ${counts[key] || 0} turnos`} onPress={() => onSelect(day)} style={({ pressed }) => ({ minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: active ? colors.primary : today ? colors.soft : 'transparent', opacity: pressed ? 0.65 : 1 })}>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: active ? 'white' : !inMonth ? '#ACA79A' : today ? colors.primary : colors.text }}>{day.getDate()}</Text>
        <View style={{ flexDirection: 'row', gap: 3, height: 6, marginTop: 3 }}>{Array.from({ length: Math.min(counts[key] || 0, 3) }, (_, i) => <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: active ? 'white' : colors.primary }} />)}</View>
      </Pressable></View>
    })}</View>)}</View>
  </View>
}
