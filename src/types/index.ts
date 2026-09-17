export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'noShow'

export type PhotoType = 'before' | 'after' | 'progress'

export interface Client {
  id: string
  firstName: string
  lastName: string
  phone?: string
  email?: string
  dateOfBirth?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Appointment {
  id: string
  clientId: string
  date: string
  time: string
  procedure?: string
  notes?: string
  status: AppointmentStatus
  paid?: boolean
  createdAt: string
}

export interface ClientPhoto {
  id: string
  clientId: string
  fileUrl: string
  type: PhotoType
  procedure?: string
  notes?: string
  takenAt: string
  createdAt: string
}

export interface ClinicData {
  clients: Client[]
  appointments: Appointment[]
  photos: ClientPhoto[]
}

export interface Notification {
  id: string
  type: 'nextConsult' | 'nextTreatment' | 'followUp' | 'paymentDue'
  title: string
  subtitle: string
  clientId: string
  clientName: string
  date: string
  color: string
}
