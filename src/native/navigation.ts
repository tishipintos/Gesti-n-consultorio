import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { NavigatorScreenParams } from '@react-navigation/native'
export type MainTabs = { Agenda: { date?: string } | undefined; Pacientes: undefined; Recordatorios: undefined }
export type RootStack = {
  Home: NavigatorScreenParams<MainTabs> | undefined
  Client: { id: string }
  ClientForm: { id?: string; appointmentDate?: string } | undefined
  SelectPatient: { date: string }
  AppointmentForm: { clientId?: string; appointmentId?: string; date?: string; fromAgenda?: boolean } | undefined
  PhotoForm: { clientId: string }
  Photos: { clientId: string }
}
export type ScreenProps<T extends keyof RootStack> = NativeStackScreenProps<RootStack, T>
