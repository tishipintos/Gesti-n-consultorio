import { Component } from 'react'
import type { PropsWithChildren } from 'react'
import { ActivityIndicator, StatusBar, Text, View } from 'react-native'
import { NavigationContainer, DefaultTheme, useNavigationState } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import type { MainTabs, RootStack } from './navigation'
import { PatientFormScreen, PatientScreen, PatientsScreen } from './PatientScreens'
import { ScheduleScreen, AppointmentFormScreen } from './ScheduleScreens'
import { SelectPatientScreen } from './SelectPatientScreen'
import { PhotoFormScreen } from './PhotoScreens'
import { ProfileScreen, ProfileSectionScreen } from './ProfileScreen'
import { NotificationsScreen } from './NotificationsScreen'
import { Button } from './ui'
import { colors, fonts, styles } from './theme'
import { storageLoadError, useStore } from '../store'
import { AppHeader, BottomNav } from './chrome'
import { WelcomeOverlay } from './WelcomeOverlay'
import { profileSections } from '../utils/profiles'
import { formatDate } from '../utils'
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope'

const Stack = createNativeStackNavigator<RootStack>()
const Tab = createBottomTabNavigator<MainTabs>()
const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.bg, card: colors.surface, text: colors.text, border: colors.border } }
function Tabs() {
  const homeActive = useNavigationState(state => state.routes[state.index].name === 'Home')
  const count = useStore(s => s.clients.length)
  const appointments = useStore(s => s.appointments)
  const todayCount = appointments.filter(a => a.date === formatDate(new Date(), 'yyyy-MM-dd')).length
  return <Tab.Navigator tabBar={({ state, navigation }) => <BottomNav visible={homeActive} active={state.routes[state.index].name} onSelect={name => navigation.navigate(name)} />} screenOptions={{ animation: 'none', header: ({ options }) => <AppHeader title={options.title || ''} subtitle={options.title === 'Pacientes' ? count + ' total' : undefined} right={options.title === 'Agenda' && todayCount > 0 ? <Text style={{ backgroundColor: colors.primary, color: 'white', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, fontFamily: fonts.bold }}>{todayCount}</Text> : undefined} /> }}>
    <Tab.Screen name="Agenda" component={ScheduleScreen} options={{ title: 'Agenda' }} />
    <Tab.Screen name="Pacientes" component={PatientsScreen} options={{ title: 'Pacientes' }} />
    <Tab.Screen name="Recordatorios" component={NotificationsScreen} options={{ title: 'Notificaciones', headerShown: false }} />
    <Tab.Screen name="Perfil" component={ProfileScreen} options={{ title: 'Perfil' }} />
  </Tab.Navigator>
}
class ErrorBoundary extends Component<PropsWithChildren, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <SafeAreaView style={styles.page}><View style={[styles.content, { width: '100%', maxWidth: 512, alignSelf: 'center' }]}><Text style={styles.title}>No se pudo abrir la pantalla</Text><Text style={styles.text}>Tus datos guardados se conservan. Volvé a intentar.</Text><Button title="Reintentar" onPress={() => this.setState({ failed: false })} /></View></SafeAreaView> : this.props.children }
}
export default function NativeApp() {
  const [loaded, fontError] = useFonts({ Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold })
  if (!loaded && !fontError) return <View style={[styles.page, { justifyContent: 'center' }]}><ActivityIndicator color={colors.primary} accessibilityLabel="Cargando tipografía" /></View>
  return <SafeAreaProvider><StatusBar barStyle="dark-content" /><ErrorBoundary>{storageLoadError ? <SafeAreaView style={styles.page}><View style={[styles.content, { width: '100%', maxWidth: 512, alignSelf: 'center' }]}><Text style={styles.title}>No se pudieron leer los datos</Text><Text style={styles.text}>Cerrá y volvé a abrir la app. No se guardarán cambios sobre los datos existentes.</Text></View></SafeAreaView> : <NavigationContainer theme={theme}>
    <Stack.Navigator screenOptions={{ header: ({ navigation, options, back }) => <AppHeader title={options.title || 'Consultorio'} back={back ? () => navigation.goBack() : undefined} right={options.headerRight?.({ tintColor: colors.primary, canGoBack: !!back })} />, headerTitleStyle: { fontFamily: fonts.bold }, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="ProfileSection" component={ProfileSectionScreen} options={({ route }) => ({ title: profileSections[route.params.section].title })} />
      <Stack.Screen name="Client" component={PatientScreen} options={{ title: 'Ficha del paciente' }} />
      <Stack.Screen name="ClientForm" component={PatientFormScreen} options={{ title: 'Paciente' }} />
      <Stack.Screen name="SelectPatient" component={SelectPatientScreen} options={{ headerShown: false, presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'Turno' }} />
      <Stack.Screen name="PhotoForm" component={PhotoFormScreen} options={{ title: 'Agregar fotos' }} />
    </Stack.Navigator>
    <WelcomeOverlay />
  </NavigationContainer>}</ErrorBoundary></SafeAreaProvider>
}
