import { StyleSheet } from 'react-native'

export const colors = { bg: '#FAF6EB', surface: '#FFFFFF', text: '#342E21', muted: '#68604F', primary: '#805900', border: '#DDD2B8', edge: '#EDE5D5', danger: '#A13243', tint: '#F0E5C7', soft: '#F4EFDF', success: '#607136' }
export const fonts = { regular: 'Manrope_400Regular', medium: 'Manrope_500Medium', semibold: 'Manrope_600SemiBold', bold: 'Manrope_700Bold', extra: 'Manrope_800ExtraBold' }
export const shadow = { shadowColor: '#403014', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }
export const styles = StyleSheet.create({
  page: { flex: 1, width: '100%', backgroundColor: colors.bg },
  content: { padding: 20, gap: 20, paddingBottom: 124 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  title: { fontSize: 26, fontFamily: fonts.semibold, color: colors.text, letterSpacing: -0.6 },
  heading: { fontSize: 18, fontFamily: fonts.semibold, color: colors.text, letterSpacing: -0.3 },
  text: { fontSize: 16, lineHeight: 24, fontFamily: fonts.regular, color: colors.text },
  muted: { fontSize: 14, lineHeight: 21, fontFamily: fonts.regular, color: colors.muted },
  label: { fontSize: 13, lineHeight: 20, fontFamily: fonts.semibold, color: colors.muted },
  card: { padding: 16, gap: 12, backgroundColor: colors.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.edge },
  listRow: { paddingVertical: 18, gap: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, minHeight: 64 },
  input: { minHeight: 48, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 14, color: colors.text, fontSize: 16, fontFamily: fonts.regular },
  button: { minHeight: 48, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontFamily: fonts.semibold, textAlign: 'center' },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: colors.tint },
})
