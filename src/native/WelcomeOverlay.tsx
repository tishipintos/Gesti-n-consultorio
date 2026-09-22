import { useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { Bell, Calendar, Users } from 'lucide-react-native'
import { storage } from '../platform/storage'
import { Button } from './ui'
import { colors, fonts, styles } from './theme'

export function WelcomeOverlay() {
  const [visible, setVisible] = useState(() => {
    try { return !storage.getItem('clinic_welcome_seen') } catch { return false }
  })
  const dismiss = () => {
    try { storage.setItem('clinic_welcome_seen', 'true') } catch { /* Dismiss for this session. */ }
    setVisible(false)
  }
  return <Modal transparent visible={visible} animationType="fade" onRequestClose={dismiss}>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#00000080' }}>
      <Pressable accessibilityLabel="Cerrar bienvenida" onPress={dismiss} style={{ position: 'absolute', inset: 0 }} />
      <View style={{ width: '100%', maxWidth: 384, maxHeight: '90%', borderRadius: 24, backgroundColor: colors.surface }}>
        <ScrollView contentContainerStyle={{ padding: 28, gap: 20 }}>
          <View style={{ alignItems: 'center', gap: 12 }}><View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' }}><Calendar size={32} color={colors.primary} /></View><Text style={[styles.title, { textAlign: 'center' }]}>Bienvenido a Gestión Consultorio</Text><Text style={[styles.muted, { textAlign: 'center' }]}>Administrá los turnos, pacientes y fotos de tu consultorio en un solo lugar.</Text></View>
          {[{ title: 'Calendario', detail: 'Visualizá y agendá turnos', icon: Calendar }, { title: 'Pacientes', detail: 'Cargá datos y fotos', icon: Users }, { title: 'Alertas', detail: 'Seguimiento automático', icon: Bell }].map(item => <View key={item.title} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#FAF7EF' }}><item.icon size={22} color={colors.primary} /><View style={{ flex: 1 }}><Text style={{ fontFamily: fonts.semibold, color: colors.text, fontSize: 14 }}>{item.title}</Text><Text style={[styles.muted, { fontSize: 12 }]}>{item.detail}</Text></View></View>)}
          <Button title="Empezar" onPress={dismiss} />
        </ScrollView>
      </View>
    </View>
  </Modal>
}
