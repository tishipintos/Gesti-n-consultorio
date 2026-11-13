const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')

function loadNative(filename, imports = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../src/native', filename), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  })
  const module = { exports: {} }
  const load = name => {
    if (name in imports) return imports[name]
    if (name === 'react' || name === 'react/jsx-runtime') return require(name)
    throw new Error('Unmocked native dependency: ' + name)
  }
  new Function('require', 'module', 'exports', outputText)(load, module, module.exports)
  return module.exports
}

function descendants(element) {
  if (!React.isValidElement(element)) return []
  return [element, ...React.Children.toArray(element.props.children).flatMap(descendants)]
}

const native = { View: 'View', ScrollView: 'ScrollView', Text: 'Text', Pressable: 'Pressable', Platform: { OS: 'ios' } }
const geometry = { usePageGeometry: () => ({ frame: { width: 375 }, rightGutter: 16, wide: false }) }

test('both floating actions overlay the content and the mounted bar can hide immediately', () => {
  let focused = true
  const { FAB, BottomNav } = loadNative('chrome.tsx', {
    react: { ...React, useState: initial => [initial, () => {}], useEffect: () => {} },
    'react-native': { ...native, StyleSheet: { create: styles => styles } },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0 }) },
    '@react-navigation/native': { useIsFocused: () => focused },
    './usePageGeometry': geometry,
    './useKeyboardVisible': { useKeyboardVisible: () => false },
    '../components/AppointmentIcon': {},
    'expo-glass-effect': { isGlassEffectAPIAvailable: () => false },
    'lucide-react-native': {}, './theme': { colors: {}, fonts: {} },
    '../hooks/useNotifications': { useNotifications: () => [] },
    '../store/notificationReadState': { useNotificationReadState: selector => selector({ seen: [] }) },
  })
  for (const agenda of [true, false]) {
    const button = FAB({ label: agenda ? 'Agendar' : 'Paciente', agenda, onPress: () => {} })
    const style = button.props.style({ pressed: false })
    assert.equal(style.position, 'absolute')
    assert.equal(style.marginBottom, undefined)
    assert.equal(style.right, 16)
    assert(style.bottom >= 34 + 96)
    focused = false
    assert.equal(FAB({ label: 'Agendar', agenda, onPress: () => {} }), null)
    focused = true
    assert.equal(FAB({ label: 'Agendar', agenda, onPress: () => {} }).type, 'Pressable')
  }
  const hidden = BottomNav({ active: 'Agenda', onSelect: () => {}, visible: false })
  const shown = BottomNav({ active: 'Agenda', onSelect: () => {}, visible: true })
  assert.equal(hidden.type, 'View')
  assert.equal(hidden.props.style.opacity, 0)
  assert.equal(hidden.props.pointerEvents, 'none')
  assert.equal(hidden.props.accessibilityElementsHidden, true)
  assert.equal(shown.props.style.opacity, 1)
  assert.equal(shown.props.pointerEvents, 'box-none')
  assert.equal(hidden.props.children.type, shown.props.children.type)
})

test('Agenda keeps both booking actions and end spacing with zero or multiple appointments', () => {
  const destinations = []
  let appointments = []
  const day = '2026-11-13'
  const { ScheduleScreen } = loadNative('ScheduleScreens.tsx', {
    react: { ...React, useState: value => [typeof value === 'function' ? value() : value, () => {}] },
    './usePageGeometry': geometry,
    'react-native': { ...native, FlatList: 'FlatList' },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ bottom: 34 }) },
    '@react-navigation/native': {
      useNavigation: () => ({ navigate: (...args) => destinations.push(args) }),
      useRoute: () => ({}),
    },
    '../utils/profiles': {}, 'lucide-react-native': {}, './MonthCalendar': {},
    './AppointmentDatePicker': {}, './chrome': { FAB: 'FAB' },
    '../store': { useStore: () => ({ appointments, clients: [] }) },
    '../utils': { formatDate: () => day }, '../utils/procedures': {},
    './ui': { Empty: 'Empty' }, './theme': { styles: {}, colors: {}, fonts: {} }, './actions': {},
  })
  const empty = descendants(ScheduleScreen())
  const list = empty.find(node => node.type === 'FlatList')
  list.props.ListEmptyComponent.props.action.onPress()
  empty.find(node => node.type === 'FAB').props.onPress()
  assert.deepEqual(destinations, [['SelectPatient', { date: day }], ['SelectPatient', { date: day }]])
  assert(Object.assign({}, ...list.props.contentContainerStyle).paddingBottom >= 24)
  appointments = Array.from({ length: 8 }, (_, i) => ({ id: String(i), date: day, time: '10:00' }))
  const filled = descendants(ScheduleScreen()).find(node => node.type === 'FlatList')
  assert.equal(filled.props.data.length, 8)
  assert.deepEqual(filled.props.contentContainerStyle, list.props.contentContainerStyle)
})

test('secondary Page reserves only content spacing and the safe area', () => {
  const { Page } = loadNative('ui.tsx', {
    './usePageGeometry': geometry,
    'react-native': native,
    '@react-native-community/datetimepicker': {},
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ bottom: 34 }) },
    './theme': { colors: {}, styles: { content: { paddingBottom: 124 } } },
    '../utils': {},
    'lucide-react-native': {},
  })
  const tree = descendants(Page({ children: 'Patient or form content' }))
  assert.deepEqual(tree.map(node => node.type), ['View', 'ScrollView'])
  const scroll = tree.find(node => node.type === 'ScrollView')
  assert.equal(Object.assign({}, ...scroll.props.contentContainerStyle).paddingBottom, 58)
  assert.equal(scroll.props.automaticallyAdjustKeyboardInsets, true)
})

test('Home keeps the bar mounted and restores visibility directly from the stack route', () => {
  let activeRoute = 'Home'
  const Navigator = 'Navigator'
  const Screen = 'Screen'
  const { default: NativeApp } = loadNative('NativeApp.tsx', {
    'react-native': native,
    '@react-navigation/native': { NavigationContainer: 'NavigationContainer', DefaultTheme: { colors: {} }, useNavigationState: selector => selector({ index: 0, routes: [{ name: activeRoute }] }) },
    '@react-navigation/native-stack': { createNativeStackNavigator: () => ({ Navigator, Screen }) },
    '@react-navigation/bottom-tabs': { createBottomTabNavigator: () => ({ Navigator, Screen }) },
    'react-native-safe-area-context': { SafeAreaProvider: 'SafeAreaProvider' },
    './PatientScreens': {}, './ScheduleScreens': {}, './SelectPatientScreen': {},
    './PhotoScreens': {}, './ProfileScreen': {}, './NotificationsScreen': {}, './ui': {},
    './theme': { colors: {}, fonts: {}, styles: {} },
    '../store': { useStore: selector => selector({ clients: [], appointments: [] }) },
    './chrome': { BottomNav: 'BottomNav' }, './WelcomeOverlay': {},
    '../utils/profiles': {}, '../utils': {},
    '@expo-google-fonts/manrope': { useFonts: () => [true, null] },
  })
  const home = descendants(NativeApp()).find(node => node.props.name === 'Home')
  for (const selected of ['Agenda', 'Pacientes', 'Recordatorios', 'Perfil']) {
    const renderBar = () => home.props.component().props.tabBar({
      state: { routes: [{ name: selected }], index: 0 },
      navigation: { navigate: name => assert.equal(name, selected) },
    })
    activeRoute = 'Home'
    assert.equal(renderBar().props.active, selected)
    assert.equal(renderBar().props.visible, true)
    renderBar().props.onSelect(selected)
    activeRoute = 'Client'
    assert.equal(renderBar().type, 'BottomNav')
    assert.equal(renderBar().props.visible, false)
    activeRoute = 'SelectPatient'
    assert.equal(renderBar().props.visible, false)
    activeRoute = 'Home'
    assert.equal(renderBar().props.visible, true)
    assert.equal(renderBar().props.active, selected)
  }
})

test('long notices retain all text, mark seen and open the patient with a comfortable target', () => {
  const description = 'Control de seguimiento con una descripción extensa. '.repeat(12)
  const notice = { id: 'notice', clientId: 'patient', type: 'followUp' }
  let seen, destination
  const { NotificationsScreen } = loadNative('NotificationsScreen.tsx', {
    react: { ...React, useCallback: callback => callback },
    './usePageGeometry': geometry,
    'react-native': { ...native, SectionList: 'SectionList' },
    'lucide-react-native': {},
    '@react-navigation/native': {
      useFocusEffect: callback => callback(),
      useNavigation: () => ({ navigate: (...args) => { destination = args } }),
    },
    'date-fns': { addDays: value => value }, '../utils': { formatDate: () => '2026-11-13' },
    '../hooks/useNotifications': { useNotifications: () => [notice] },
    '../store/notificationReadState': { notificationKey: item => item.id, useNotificationReadState: selector => selector({ markSeen: keys => { seen = keys } }) },
    './chrome': { AppHeader: 'AppHeader' }, './ui': {},
    '../utils/notificationDisplay': { notificationDisplay: () => ({ title: 'Control', description }) },
    './theme': { colors: {}, fonts: {}, styles: { listRow: { paddingVertical: 18, minHeight: 64 } } },
  })
  const list = descendants(NotificationsScreen()).find(node => node.type === 'SectionList')
  const row = list.props.renderItem({ item: notice })
  const rowStyle = Object.assign({}, ...row.props.style({ pressed: false }))
  assert(rowStyle.paddingVertical < 18)
  assert(rowStyle.minHeight >= 44)
  const texts = descendants(row).filter(node => node.type === 'Text')
  assert.equal(texts.length, 2)
  assert.equal(texts[1].props.children, description)
  assert.equal(texts[1].props.numberOfLines, undefined)
  row.props.onPress()
  assert.deepEqual(destination, ['Client', { id: 'patient' }])
  assert.deepEqual(seen, ['notice'])
})
