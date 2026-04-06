import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: '4rem' }}>🏠</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--gray-900)' }}>404</h1>
      <p style={{ color: 'var(--gray-500)', maxWidth: 300 }}>This page doesn't exist. Let's get you back home.</p>
      <Link to="/dashboard" className="btn btn-primary btn-md">Go to Dashboard</Link>
    </div>
  )
}
