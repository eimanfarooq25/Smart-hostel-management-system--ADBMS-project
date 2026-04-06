import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, BedDouble, Building2, UtensilsCrossed,
  AlertCircle, Wrench, Users, ShieldCheck, LogOut, Menu, X,
  Star, ChevronRight, Package
} from 'lucide-react'
import './layout.css'

const NAV = {
  student: [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/hostels', icon: <Building2 size={18} />, label: 'Browse Hostels' },
    { to: '/bookings', icon: <BedDouble size={18} />, label: 'My Bookings' },
    { to: '/meals', icon: <UtensilsCrossed size={18} />, label: 'Meal Plans' },
    { to: '/complaints', icon: <AlertCircle size={18} />, label: 'Complaints' },
    { to: '/maintenance', icon: <Wrench size={18} />, label: 'Maintenance' },
    { to: '/guests', icon: <Users size={18} />, label: 'Guest Registration' },
  ],
  warden: [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/complaints', icon: <AlertCircle size={18} />, label: 'Complaints' },
    { to: '/maintenance', icon: <Wrench size={18} />, label: 'Maintenance' },
    { to: '/guests', icon: <Users size={18} />, label: 'Guest Approvals' },
  ],
  hostel_owner: [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/hostels', icon: <Building2 size={18} />, label: 'My Hostels' },
    { to: '/amenities', icon: <Package size={18} />, label: 'Amenities' },
    { to: '/analytics', icon: <Star size={18} />, label: 'Analytics' },
  ],
  super_admin: [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/hostels', icon: <Building2 size={18} />, label: 'All Hostels' },
    { to: '/amenities', icon: <Package size={18} />, label: 'Amenities' },
    { to: '/complaints', icon: <AlertCircle size={18} />, label: 'Complaints' },
    { to: '/maintenance', icon: <Wrench size={18} />, label: 'Maintenance' },
    { to: '/guests', icon: <Users size={18} />, label: 'Guest Approvals' },
    { to: '/analytics', icon: <ShieldCheck size={18} />, label: 'Analytics' },
  ],
}

const ROLE_COLORS = {
  student: { bg: '#FFF4EF', text: '#FF6B35', label: 'Student' },
  warden: { bg: '#EFF6FF', text: '#3B82F6', label: 'Warden' },
  hostel_owner: { bg: '#F0FDF4', text: '#10B981', label: 'Owner' },
  super_admin: { bg: '#FDF4FF', text: '#A855F7', label: 'Admin' },
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = NAV[user?.role] || []
  const roleInfo = ROLE_COLORS[user?.role] || {}

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const Sidebar = () => (
    <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo__icon">🏠</div>
        <div>
          <span className="sidebar-logo__name">HostelBuddy</span>
          <span className="sidebar-logo__tag">Smart Management</span>
        </div>
      </div>

      {/* User Profile */}
      <div className="sidebar-user">
        <div className="sidebar-user__avatar">{user?.full_name?.[0]?.toUpperCase() || 'U'}</div>
        <div className="sidebar-user__info">
          <p className="sidebar-user__name">{user?.full_name}</p>
          <span className="badge" style={{ background: roleInfo.bg, color: roleInfo.text, fontSize: '0.7rem' }}>
            {roleInfo.label}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="sidebar-nav__section">Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-nav__item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="sidebar-nav__icon">{item.icon}</span>
            <span className="sidebar-nav__label">{item.label}</span>
            <ChevronRight size={14} className="sidebar-nav__arrow" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={18} />
        <span>Log Out</span>
      </button>
    </aside>
  )

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {mobileOpen && <div className="layout-overlay" onClick={() => setMobileOpen(false)} />}

      <Sidebar />

      <main className="layout-main">
        {/* Top bar */}
        <header className="topbar">
          <button className="topbar-menu" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="topbar-avatar">{user?.full_name?.[0]?.toUpperCase() || 'U'}</div>
              <span className="topbar-name">{user?.full_name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="layout-content">
          {children}
        </div>
      </main>
    </div>
  )
}
