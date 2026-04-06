import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './ui/index.jsx'

export default function ProtectedRoute({ children, roles }) {
  const { user, initializing } = useAuth()

  if (initializing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🏠</div>
          <Spinner size="lg" />
          <p style={{ marginTop: 12, color: 'var(--gray-400)', fontSize: '0.875rem' }}>Loading HostelBuddy…</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
