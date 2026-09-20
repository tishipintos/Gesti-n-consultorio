import { StyleSheet } from 'react-native'

export const colors = { bg: '#FAF6EB', surface: '#FFFFFF', text: '#342E21', muted: '#68604F', primary: '#916800', border: '#DDD5C4', danger: '#B54852', tint: '#F0E5C7' }
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 18, paddingBottom: 40, width: '100%', maxWidth: 760, alignSelf: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  heading: { fontSize: 19, fontWeight: '600', color: colors.text },
  text: { fontSize: 16, lineHeight: 24, color: colors.text },
  muted: { fontSize: 15, lineHeight: 22, color: colors.muted },
  card: { padding: 16, gap: 12, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  input: { minHeight: 50, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 12, color: colors.text, fontSize: 17 },
  button: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: colors.tint },
})
