import { useState, useEffect } from 'react'
import { complaintAPI, maintenanceAPI, hostelAPI, bookingAPI } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { StatCard, Spinner } from '../../components/ui/index.jsx'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts'
import { Building2, AlertCircle, Wrench, TrendingUp } from 'lucide-react'
import './analytics.css'

const COLORS = ['#FF6B35', '#4ECDC4', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow)' }}>
      <p style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 4, color: 'var(--gray-700)' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ fontSize: '0.82rem', color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { isRole } = useAuth()
  const [data, setData] = useState({ complaints: [], maintenance: [], hostels: [], bookings: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calls = [
      complaintAPI.getAll().then((r) => r.data.complaints || []).catch(() => []),
      maintenanceAPI.getAll().then((r) => r.data.requests || r.data.maintenance_requests || []).catch(() => []),
      hostelAPI.getAll().then((r) => r.data.hostels || []).catch(() => []),
    ]
    if (isRole('student')) {
      calls.push(bookingAPI.getAll().then((r) => r.data.bookings || []).catch(() => []))
    }
    Promise.all(calls).then(([complaints, maintenance, hostels, bookings = []]) => {
      setData({ complaints, maintenance, hostels, bookings })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-wrapper"><Spinner size="lg" center /></div>

  const { complaints, maintenance, hostels, bookings } = data

  // Complaint by category chart data
  const complaintByCategory = Object.entries(
    complaints.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value }))

  // Complaint by status pie
  const complaintByStatus = Object.entries(
    complaints.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name: name.replace('_', ' '), value }))

  // Maintenance by priority
  const maintenanceByPriority = Object.entries(
    maintenance.reduce((acc, m) => { acc[m.priority || 'medium'] = (acc[m.priority || 'medium'] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value }))

  // Maintenance status trend
  const maintenanceByStatus = Object.entries(
    maintenance.reduce((acc, m) => { acc[m.status] = (acc[m.status] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name: name.replace('_', ' '), value }))

  // Hostels by city
  const hostelsByCity = Object.entries(
    hostels.reduce((acc, h) => { if (h.city) acc[h.city] = (acc[h.city] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value }))

  // Bookings by status (student)
  const bookingsByStatus = Object.entries(
    bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value }))

  const statPrimary = isRole('student')
    ? [
      { label: 'Total Bookings', value: bookings.length, icon: <TrendingUp size={22} />, color: 'primary' },
      { label: 'Confirmed', value: bookings.filter((b) => b.status === 'confirmed').length, icon: <TrendingUp size={22} />, color: 'success' },
      { label: 'My Complaints', value: complaints.length, icon: <AlertCircle size={22} />, color: 'warning' },
      { label: 'Maintenance', value: maintenance.length, icon: <Wrench size={22} />, color: 'info' },
    ]
    : [
      { label: 'Total Hostels', value: hostels.length, icon: <Building2 size={22} />, color: 'primary' },
      { label: 'Total Complaints', value: complaints.length, icon: <AlertCircle size={22} />, color: 'warning' },
      { label: 'Maintenance', value: maintenance.length, icon: <Wrench size={22} />, color: 'info' },
      { label: 'Resolved', value: complaints.filter((c) => c.status === 'resolved').length, icon: <TrendingUp size={22} />, color: 'success' },
    ]

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Visual overview of hostel activities and metrics</p>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {statPrimary.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts Grid */}
      <div className="analytics-grid">

        {/* Complaints by Category */}
        {complaintByCategory.length > 0 && (
          <div className="chart-card card">
            <h3 className="chart-title">Complaints by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={complaintByCategory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--gray-500)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--gray-500)' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Complaints" fill="var(--primary)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Complaint Status Pie */}
        {complaintByStatus.length > 0 && (
          <div className="chart-card card">
            <h3 className="chart-title">Complaint Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={complaintByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {complaintByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Maintenance by Priority */}
        {maintenanceByPriority.length > 0 && (
          <div className="chart-card card">
            <h3 className="chart-title">Maintenance by Priority</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={maintenanceByPriority} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--gray-500)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--gray-500)' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Requests" fill="var(--accent)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Maintenance Status */}
        {maintenanceByStatus.length > 0 && (
          <div className="chart-card card">
            <h3 className="chart-title">Maintenance Status Overview</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={maintenanceByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {maintenanceByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Hostels by City */}
        {hostelsByCity.length > 0 && !isRole('student') && (
          <div className="chart-card card">
            <h3 className="chart-title">Hostels by City</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hostelsByCity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--gray-500)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--gray-500)' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Hostels" fill="#8B5CF6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bookings by Status (student) */}
        {isRole('student') && bookingsByStatus.length > 0 && (
          <div className="chart-card card">
            <h3 className="chart-title">My Bookings by Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bookingsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {bookingsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {(complaintByCategory.length === 0 && maintenanceByPriority.length === 0) && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>
          <p style={{ fontSize: '3rem', marginBottom: 16 }}>📊</p>
          <p>No data to visualize yet. Once complaints and maintenance requests are added, charts will appear here.</p>
        </div>
      )}
    </div>
  )
}
