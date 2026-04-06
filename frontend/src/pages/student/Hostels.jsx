import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { hostelAPI } from '../../api/client'
import { Spinner, EmptyState } from '../../components/ui/index.jsx'
import { Search, SlidersHorizontal, MapPin, Star, Users, ChevronRight, X } from 'lucide-react'
import '../../components/ui/ui.css'
import './hostels.css'

export default function Hostels() {
  const navigate = useNavigate()
  const [hostels, setHostels] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ city: '', gender: '', minRating: '' })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    hostelAPI.getAll()
      .then((r) => { setHostels(r.data.hostels || []); setFiltered(r.data.hostels || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = [...hostels]
    if (search) result = result.filter((h) =>
      h.hostel_name?.toLowerCase().includes(search.toLowerCase()) ||
      h.city?.toLowerCase().includes(search.toLowerCase()) ||
      h.address?.toLowerCase().includes(search.toLowerCase())
    )
    if (filters.city) result = result.filter((h) => h.city === filters.city)
    if (filters.gender) result = result.filter((h) => h.gender === filters.gender)
    if (filters.minRating) result = result.filter((h) => parseFloat(h.rating) >= parseFloat(filters.minRating))
    setFiltered(result)
  }, [search, filters, hostels])

  const cities = [...new Set(hostels.map((h) => h.city).filter(Boolean))]
  const activeFilters = Object.values(filters).filter(Boolean).length

  const clearFilters = () => {
    setFilters({ city: '', gender: '', minRating: '' })
    setSearch('')
  }

  const genderBadge = (g) => {
    const map = { male: { color: '#3B82F6', bg: '#EFF6FF', label: '♂ Male' }, female: { color: '#EC4899', bg: '#FDF2F8', label: '♀ Female' }, 'co-ed': { color: '#8B5CF6', bg: '#F5F3FF', label: '⚥ Co-ed' } }
    const s = map[g] || { color: '#6B7280', bg: '#F3F4F6', label: g }
    return <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
  }

  if (loading) return <div className="page-wrapper"><Spinner size="lg" center /></div>

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Browse Hostels</h1>
        <p className="page-subtitle">Find and book your perfect hostel stay</p>
      </div>

      {/* Search + Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap" style={{ maxWidth: 380 }}>
          <Search size={16} className="search-icon" />
          <input className="form-input has-icon" placeholder="Search by name, city or address…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className={`btn btn-secondary btn-md filter-btn ${activeFilters ? 'filter-btn--active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={16} />
          Filters {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}
        </button>
        {(activeFilters > 0 || search) && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            <X size={14} /> Clear
          </button>
        )}
        <span className="results-count">{filtered.length} hostel{filtered.length !== 1 ? 's' : ''} found</span>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel card">
          <div className="filter-panel-grid">
            <div className="form-group">
              <label className="form-label">City</label>
              <select className="form-input form-select" value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
                <option value="">All Cities</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-input form-select" value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}>
                <option value="">All Types</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="co-ed">Co-ed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Min Rating</label>
              <select className="form-input form-select" value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}>
                <option value="">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Hostel Cards */}
      {filtered.length === 0
        ? <EmptyState icon="🏠" title="No hostels found" description="Try adjusting your search or filters" />
        : (
          <div className="hostel-grid">
            {filtered.map((h) => (
              <div key={h.hostel_id} className="hostel-card card"
                onClick={() => navigate(`/hostels/${h.hostel_id}`)}>
                <div className="hostel-card__header">
                  <div className="hostel-card__icon">🏠</div>
                  <div className="hostel-card__badges">
                    {genderBadge(h.gender)}
                    {h.rating && (
                      <span className="badge badge-warning">
                        <Star size={10} style={{ fill: 'currentColor' }} /> {parseFloat(h.rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="hostel-card__name">{h.hostel_name}</h3>
                <p className="hostel-card__location">
                  <MapPin size={13} /> {h.city}{h.address ? ` · ${h.address}` : ''}
                </p>
                <div className="hostel-card__footer">
                  <span className="hostel-card__capacity">
                    <Users size={13} /> {h.total_capacity} beds
                  </span>
                  <span className="hostel-card__cta">
                    View Rooms <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
