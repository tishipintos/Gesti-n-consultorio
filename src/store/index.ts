import { isAvailableProcedure } from '../utils/procedures'
import { create } from 'zustand'
import type { Client, Appointment, ClientPhoto, ClinicData } from '../types'
import { generateId } from '../utils'
import { storage } from '../platform/storage'

const STORAGE_KEY = 'clinic_data'
export let storageLoadError: unknown = null

const loadFromStorage = (): ClinicData => {
  try {
    const data = storage.getItem(STORAGE_KEY)
    if (data) {
      const parsed: ClinicData = JSON.parse(data)
      if (!parsed || !Array.isArray(parsed.clients) || !Array.isArray(parsed.appointments) || !Array.isArray(parsed.photos)) {
        throw new Error('Los datos guardados no tienen el formato esperado.')
      }
      return parsed
    }
  } catch (error) {
    storageLoadError = error
    console.warn('Error loading data from localStorage:', error)
  }
  return { clients: [], appointments: [], photos: [] }
}

const saveToStorage = (state: ClinicData): void => {
  if (storageLoadError) throw new Error('No se pudieron leer los datos existentes. Reiniciá la app antes de guardar cambios.')
  storage.setItem(STORAGE_KEY, JSON.stringify(state))
}

interface StoreState {
  clients: Client[]
  appointments: Appointment[]
  photos: ClientPhoto[]
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Client
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void
  getClient: (id: string) => Client | undefined
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment
  updateAppointment: (id: string, data: Partial<Appointment>) => void
  deleteAppointment: (id: string) => void
  getAppointmentsForClient: (clientId: string) => Appointment[]
  getAppointmentsForDate: (date: string) => Appointment[]
  addPhoto: (photo: Omit<ClientPhoto, 'id' | 'createdAt'>) => ClientPhoto
  deletePhoto: (id: string) => void
  getPhotosForClient: (clientId: string) => ClientPhoto[]
  clearAllData: () => void
}

export const useStore = create<StoreState>((set, get) => {
  const initial = loadFromStorage()

  return {
    clients: initial.clients,
    appointments: initial.appointments,
    photos: initial.photos,

    addClient: (clientData) => {
      const now = new Date().toISOString()
      const client: Client = {
        ...clientData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }
      set((state) => {
        const newState = { clients: [...state.clients, client] }
        saveToStorage({ ...state, ...newState })
        return newState
      })
      return client
    },

    updateClient: (id, data) => {
      set((state) => {
        const clients = state.clients.map((c) =>
          c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
        )
        saveToStorage({ ...state, clients })
        return { clients }
      })
    },

    deleteClient: (id) => {
      set((state) => {
        const clients = state.clients.filter((c) => c.id !== id)
        const appointments = state.appointments.filter((a) => a.clientId !== id)
        const photos = state.photos.filter((p) => p.clientId !== id)
        saveToStorage({ clients, appointments, photos })
        return { clients, appointments, photos }
      })
    },

    getClient: (id) => get().clients.find((c) => c.id === id),

    addAppointment: (appointmentData) => {
      if (!isAvailableProcedure(appointmentData.procedure)) throw new Error('Elegí un motivo de consulta disponible')
      const appointment: Appointment = {
        ...appointmentData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }
      set((state) => {
        const appointments = [...state.appointments, appointment]
        saveToStorage({ ...state, appointments })
        return { appointments }
      })
      return appointment
    },

    updateAppointment: (id, data) => {
      if ('procedure' in data && !isAvailableProcedure(data.procedure)) throw new Error('Elegí un motivo de consulta disponible')
      set((state) => {
        const appointments = state.appointments.map((a) =>
          a.id === id ? { ...a, ...data } : a
        )
        saveToStorage({ ...state, appointments })
        return { appointments }
      })
    },

    deleteAppointment: (id) => {
      set((state) => {
        const appointments = state.appointments.filter((a) => a.id !== id)
        saveToStorage({ ...state, appointments })
        return { appointments }
      })
    },

    getAppointmentsForClient: (clientId) =>
      get().appointments.filter((a) => a.clientId === clientId),

    getAppointmentsForDate: (date) =>
      get().appointments.filter((a) => a.date === date),

    addPhoto: (photoData) => {
      const photo: ClientPhoto = {
        ...photoData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }
      set((state) => {
        const photos = [...state.photos, photo]
        saveToStorage({ ...state, photos })
        return { photos }
      })
      return photo
    },

    deletePhoto: (id) => {
      set((state) => {
        const photos = state.photos.filter((p) => p.id !== id)
        saveToStorage({ ...state, photos })
        return { photos }
      })
    },

    getPhotosForClient: (clientId) =>
      get().photos.filter((p) => p.clientId === clientId),

    clearAllData: () => {
      saveToStorage({ clients: [], appointments: [], photos: [] })
      set({ clients: [], appointments: [], photos: [] })
    },
  }
})
