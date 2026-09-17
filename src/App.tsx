import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TabBar } from './components/TabBar'
import { ToastContainer } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import { WelcomeOverlay } from './components/WelcomeOverlay'
import { useToast } from './hooks/useToast'
import { CalendarScreen } from './screens/CalendarScreen'
import { ClientsScreen } from './screens/ClientsScreen'
import { ClientDetailScreen } from './screens/ClientDetailScreen'
import { ClientFormScreen } from './screens/ClientFormScreen'
import { AppointmentFormScreen } from './screens/AppointmentFormScreen'
import { PhotoFormScreen } from './screens/PhotoFormScreen'
import { PhotoCompareScreen } from './screens/PhotoCompareScreen'
import { NotificationsScreen } from './screens/NotificationsScreen'

function App() {
  const { toast, toasts, removeToast } = useToast()

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <WelcomeOverlay onComplete={() => {}} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <div className="min-h-screen bg-bg">
          <Routes>
            <Route path="/" element={<Navigate to="/calendar" replace />} />
            <Route path="/calendar" element={<CalendarScreen toast={toast} />} />
            <Route path="/clients" element={<ClientsScreen />} />
            <Route path="/clients/new" element={<ClientFormScreen toast={toast} />} />
            <Route path="/clients/:id" element={<ClientDetailScreen toast={toast} />} />
            <Route path="/clients/:id/edit" element={<ClientFormScreen toast={toast} />} />
            <Route path="/clients/:id/appointments/new" element={<AppointmentFormScreen toast={toast} />} />
            <Route path="/clients/:id/photos/new" element={<PhotoFormScreen toast={toast} />} />
            <Route path="/clients/:id/photos/compare" element={<PhotoCompareScreen />} />
            <Route path="/notifications" element={<NotificationsScreen />} />
          </Routes>
          <TabBar />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
