import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Shared
import Dashboard from './pages/shared/Dashboard'
import Complaints from './pages/shared/Complaints'
import Maintenance from './pages/shared/Maintenance'
import Guests from './pages/shared/Guests'
import Analytics from './pages/shared/Analytics'

// Student
import Hostels from './pages/student/Hostels'
import HostelDetail from './pages/student/HostelDetail'
import BookRoom from './pages/student/BookRoom'
import MyBookings from './pages/student/MyBookings'
import Meals from './pages/student/Meals'

// Admin/Owner
import Amenities from './pages/admin/Amenities'

import NotFound from './pages/NotFound'

// Import all CSS
import './components/ui/ui.css'

function AppLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected */}
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/hostels" element={<AppLayout><Hostels /></AppLayout>} />
        <Route path="/hostels/:id" element={<AppLayout><HostelDetail /></AppLayout>} />
        <Route path="/book/:roomId" element={
          <ProtectedRoute roles={['student']}>
            <DashboardLayout><BookRoom /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute roles={['student']}>
            <DashboardLayout><MyBookings /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/meals" element={
          <ProtectedRoute roles={['student']}>
            <DashboardLayout><Meals /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/complaints" element={<AppLayout><Complaints /></AppLayout>} />
        <Route path="/maintenance" element={<AppLayout><Maintenance /></AppLayout>} />
        <Route path="/guests" element={<AppLayout><Guests /></AppLayout>} />
        <Route path="/amenities" element={
          <ProtectedRoute roles={['hostel_owner', 'super_admin']}>
            <DashboardLayout><Amenities /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
