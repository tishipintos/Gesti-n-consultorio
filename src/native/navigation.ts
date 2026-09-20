import type { NativeStackScreenProps } from '@react-navigation/native-stack'
export type RootStack = {
  Home: undefined
  Client: { id: string }
  ClientForm: { id?: string } | undefined
  AppointmentForm: { clientId?: string; appointmentId?: string; date?: string } | undefined
  PhotoForm: { clientId: string }
  Photos: { clientId: string }
}
export type ScreenProps<T extends keyof RootStack> = NativeStackScreenProps<RootStack, T>
