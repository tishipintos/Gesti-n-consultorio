import { Component } from 'react'
import type { PropsWithChildren } from 'react'
import { StatusBar, Text, View } from 'react-native'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RootStack } from './navigation'
import { PatientFormScreen, PatientScreen, PatientsScreen } from './PatientScreens'
import { ScheduleScreen, AppointmentFormScreen } from './ScheduleScreens'
import { PhotoFormScreen, PhotosScreen } from './PhotoScreens'
import { NotificationsScreen } from './NotificationsScreen'
import { Button } from './ui'
import { colors, styles } from './theme'
import { useNotifications } from '../hooks/useNotifications'
import { notificationKey, useNotificationReadState } from '../store/notificationReadState'
import { storageLoadError } from '../store'

const Stack = createNativeStackNavigator<RootStack>()
const Tab = createBottomTabNavigator()
const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.bg, card: colors.surface, text: colors.text, border: colors.border } }
function Tabs() {
  const insets = useSafeAreaInsets()
  const notifications = useNotifications()
  const seen = useNotificationReadState(s => s.seen)
  const unread = notifications.filter(n => !seen.includes(notificationKey(n))).length
  return <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarStyle: { height: 64 + insets.bottom }, tabBarLabelStyle: { fontSize: 14, fontWeight: '600' }, tabBarIconStyle: { display: 'none' }, tabBarItemStyle: { minHeight: 48, paddingVertical: 8 } }}>
    <Tab.Screen name="Agenda" component={ScheduleScreen} />
    <Tab.Screen name="Pacientes" component={PatientsScreen} />
    <Tab.Screen name="Recordatorios" component={NotificationsScreen} options={{ tabBarBadge: unread || undefined }} />
  </Tab.Navigator>
}
class ErrorBoundary extends Component<PropsWithChildren, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <SafeAreaView style={styles.page}><View style={styles.content}><Text style={styles.title}>No se pudo abrir la pantalla</Text><Text style={styles.text}>Tus datos guardados se conservan. Volvé a intentar.</Text><Button title="Reintentar" onPress={() => this.setState({ failed: false })} /></View></SafeAreaView> : this.props.children }
}
export default function NativeApp() {
  return <SafeAreaProvider><StatusBar barStyle="dark-content" /><ErrorBoundary>{storageLoadError ? <SafeAreaView style={styles.page}><View style={styles.content}><Text style={styles.title}>No se pudieron leer los datos</Text><Text style={styles.text}>Cerrá y volvé a abrir la app. No se guardarán cambios sobre los datos existentes.</Text></View></SafeAreaView> : <NavigationContainer theme={theme}>
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.bg }, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Home" component={Tabs} options={{ title: 'Consultorio' }} />
      <Stack.Screen name="Client" component={PatientScreen} options={{ title: 'Ficha del paciente' }} />
      <Stack.Screen name="ClientForm" component={PatientFormScreen} options={{ title: 'Paciente' }} />
      <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'Turno' }} />
      <Stack.Screen name="PhotoForm" component={PhotoFormScreen} options={{ title: 'Nueva foto' }} />
      <Stack.Screen name="Photos" component={PhotosScreen} options={{ title: 'Evolución' }} />
    </Stack.Navigator>
  </NavigationContainer>}</ErrorBoundary></SafeAreaProvider>
}
