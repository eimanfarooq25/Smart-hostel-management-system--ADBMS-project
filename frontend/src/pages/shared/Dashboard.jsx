import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { StatCard, Spinner, StatusBadge } from '../../components/ui/index.jsx'
import { bookingAPI, complaintAPI, maintenanceAPI, hostelAPI } from '../../api/client'
import { BedDouble, AlertCircle, Wrench, Building2, Users, TrendingUp } from 'lucide-react'
import './dashboard.css'

export default function Dashboard() {
  const { user, isRole } = useAuth()
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetches = []
    if (isRole('student')) {
      fetches.push(
        bookingAPI.getAll().then((r) => setData((d) => ({ ...d, bookings: r.data.bookings || [] }))).catch(() => {}),
        complaintAPI.getAll().then((r) => setData((d) => ({ ...d, complaints: r.data.complaints || [] }))).catch(() => {}),
        maintenanceAPI.getAll().then((r) => setData((d) => ({ ...d, maintenance: r.data.requests || [] }))).catch(() => {}),
      )
    }
    if (isRole('warden', 'super_admin', 'hostel_owner')) {
      fetches.push(
        complaintAPI.getAll().then((r) => setData((d) => ({ ...d, complaints: r.data.complaints || [] }))).catch(() => {}),
        maintenanceAPI.getAll().then((r) => setData((d) => ({ ...d, maintenance: r.data.requests || [] }))).catch(() => {}),
        hostelAPI.getAll().then((r) => setData((d) => ({ ...d, hostels: r.data.hostels || [] }))).catch(() => {}),
      )
    }
    Promise.all(fetches).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-wrapper"><Spinner size="lg" center /></div>

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">{greet()}, {user?.full_name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's what's happening in your hostel world today.</p>
      </div>

      {/* Student Stats */}
      {isRole('student') && (
        <>
          <div className="grid-4" style={{ marginBottom: 28 }}>
            <StatCard label="Total Bookings" value={data.bookings?.length ?? 0} icon={<BedDouble size={22} />} color="primary" />
            <StatCard label="Active Booking" value={data.bookings?.filter((b) => b.status === 'confirmed').length ?? 0} icon={<TrendingUp size={22} />} color="success" />
            <StatCard label="Open Complaints" value={data.complaints?.filter((c) => c.status === 'open').length ?? 0} icon={<AlertCircle size={22} />} color="warning" />
            <StatCard label="Maintenance" value={data.maintenance?.filter((m) => m.status === 'open').length ?? 0} icon={<Wrench size={22} />} color="info" />
          </div>

          <div className="grid-2">
            {/* Recent Bookings */}
            <div className="card" style={{ padding: 24 }}>
              <div className="section-header">
                <h3 className="section-title">Recent Bookings</h3>
                <Link to="/bookings" className="btn btn-ghost btn-sm">View all</Link>
              </div>
              {(data.bookings || []).length === 0
                ? <p className="text-muted" style={{ fontSize: '0.875rem' }}>No bookings yet. <Link to="/hostels" className="text-primary">Browse hostels →</Link></p>
                : (data.bookings || []).slice(0, 4).map((b) => (
                  <div key={b.booking_id} className="dash-row">
                    <div>
                      <p className="dash-row__label">Booking #{b.booking_id}</p>
                      <p className="dash-row__sub">{b.booking_start_date?.slice(0,10)} → {b.booking_end_date?.slice(0,10)}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))
              }
            </div>

            {/* Recent Complaints */}
            <div className="card" style={{ padding: 24 }}>
              <div className="section-header">
                <h3 className="section-title">Recent Complaints</h3>
                <Link to="/complaints" className="btn btn-ghost btn-sm">View all</Link>
              </div>
              {(data.complaints || []).length === 0
                ? <p className="text-muted" style={{ fontSize: '0.875rem' }}>No complaints filed.</p>
                : (data.complaints || []).slice(0, 4).map((c) => (
                  <div key={c.complaint_id} className="dash-row">
                    <div>
                      <p className="dash-row__label">{c.subject}</p>
                      <p className="dash-row__sub">{c.category}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))
              }
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3 className="section-title" style={{ marginBottom: 16 }}>Quick Actions</h3>
            <div className="quick-actions-grid">
              <Link to="/hostels" className="quick-action-card">
                <span className="quick-action-icon">🏠</span>
                <span>Book a Room</span>
              </Link>
              <Link to="/complaints/new" className="quick-action-card">
                <span className="quick-action-icon">📢</span>
                <span>File Complaint</span>
              </Link>
              <Link to="/maintenance/new" className="quick-action-card">
                <span className="quick-action-icon">🔧</span>
                <span>Report Issue</span>
              </Link>
              <Link to="/guests/new" className="quick-action-card">
                <span className="quick-action-icon">👥</span>
                <span>Register Guest</span>
              </Link>
              <Link to="/meals" className="quick-action-card">
                <span className="quick-action-icon">🍽️</span>
                <span>Meal Plans</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Staff/Admin Stats */}
      {isRole('warden', 'super_admin', 'hostel_owner') && (
        <>
          <div className="grid-4" style={{ marginBottom: 28 }}>
            <StatCard label="Total Hostels" value={data.hostels?.length ?? 0} icon={<Building2 size={22} />} color="primary" />
            <StatCard label="Open Complaints" value={data.complaints?.filter((c) => c.status === 'open').length ?? 0} icon={<AlertCircle size={22} />} color="warning" />
            <StatCard label="In-Progress" value={data.maintenance?.filter((m) => m.status === 'in_progress').length ?? 0} icon={<Wrench size={22} />} color="info" />
            <StatCard label="Resolved" value={data.complaints?.filter((c) => c.status === 'resolved').length ?? 0} icon={<TrendingUp size={22} />} color="success" />
          </div>

          <div className="grid-2">
            <div className="card" style={{ padding: 24 }}>
              <div className="section-header">
                <h3 className="section-title">Pending Complaints</h3>
                <Link to="/complaints" className="btn btn-ghost btn-sm">Manage</Link>
              </div>
              {(data.complaints || []).filter((c) => c.status === 'open').slice(0, 5).map((c) => (
                <div key={c.complaint_id} className="dash-row">
                  <div>
                    <p className="dash-row__label">{c.subject}</p>
                    <p className="dash-row__sub">{c.category} · {c.priority}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
              {!(data.complaints || []).filter((c) => c.status === 'open').length &&
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>All clear! No open complaints.</p>}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div className="section-header">
                <h3 className="section-title">Maintenance Requests</h3>
                <Link to="/maintenance" className="btn btn-ghost btn-sm">Manage</Link>
              </div>
              {(data.maintenance || []).filter((m) => ['open','in_progress'].includes(m.status)).slice(0, 5).map((m) => (
                <div key={m.request_id} className="dash-row">
                  <div>
                    <p className="dash-row__label">Room {m.room_id}</p>
                    <p className="dash-row__sub">{m.issue_description?.slice(0, 50)}...</p>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              ))}
              {!(data.maintenance || []).filter((m) => ['open','in_progress'].includes(m.status)).length &&
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>No pending requests.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
