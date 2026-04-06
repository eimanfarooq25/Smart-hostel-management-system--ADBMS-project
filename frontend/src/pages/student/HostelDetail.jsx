import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { hostelAPI } from '../../api/client'
import { Spinner, StatusBadge, Button } from '../../components/ui/index.jsx'
import { useAuth } from '../../context/AuthContext'
import { MapPin, Star, Users, ArrowLeft, BedDouble } from 'lucide-react'
import './hostels.css'

export default function HostelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [hostel, setHostel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [floorFilter, setFloorFilter] = useState('')

  useEffect(() => {
    Promise.all([hostelAPI.getById(id), hostelAPI.getRooms(id)])
      .then(([h, r]) => {
        setHostel(h.data.hostel || h.data)
        setRooms(r.data.rooms || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page-wrapper"><Spinner size="lg" center /></div>
  if (!hostel) return <div className="page-wrapper"><p>Hostel not found.</p></div>

  const floors = [...new Set(rooms.map((r) => r.floor_number).filter(Boolean))].sort((a, b) => a - b)
  const filteredRooms = floorFilter ? rooms.filter((r) => String(r.floor_number) === floorFilter) : rooms

  const genderColor = { male: '#3B82F6', female: '#EC4899', 'co-ed': '#8B5CF6' }

  return (
    <div className="page-wrapper">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate('/hostels')}>
        <ArrowLeft size={15} /> Back to Hostels
      </button>

      {/* Hero */}
      <div className="hostel-detail-hero">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: '2rem' }}>🏠</span>
            {hostel.gender && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                {hostel.gender}
              </span>
            )}
            {hostel.rating && (
              <span className="badge" style={{ background: 'rgba(255,107,53,0.3)', color: '#FFB347' }}>
                <Star size={11} style={{ fill: 'currentColor' }} /> {parseFloat(hostel.rating).toFixed(1)}
              </span>
            )}
          </div>
          <h2>{hostel.hostel_name}</h2>
          <p><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {hostel.city}{hostel.address ? ` — ${hostel.address}` : ''}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Total Capacity</p>
          <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>{hostel.total_capacity}</p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>beds</p>
        </div>
      </div>

      {/* Rooms */}
      <div className="card" style={{ padding: 24 }}>
        <div className="section-header">
          <h3 className="section-title">Available Rooms</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {floors.length > 0 && (
              <select className="form-input form-select" style={{ width: 'auto', padding: '6px 32px 6px 12px', fontSize: '0.82rem' }}
                value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)}>
                <option value="">All Floors</option>
                {floors.map((f) => <option key={f} value={f}>Floor {f}</option>)}
              </select>
            )}
          </div>
        </div>
        {filteredRooms.length === 0
          ? <p className="text-muted" style={{ textAlign: 'center', padding: '32px 0' }}>No rooms found.</p>
          : (
            <div className="rooms-grid">
              {filteredRooms.map((room) => (
                <div key={room.room_id} className="room-card"
                  onClick={() => user ? navigate(`/book/${room.room_id}`) : navigate('/login')}>
                  <p className="room-card__number">Room {room.room_number}</p>
                  <p className="room-card__type">{room.room_type} · Floor {room.floor_number}</p>
                  <div className="room-card__info">
                    <span><Users size={12} /> {room.capacity} beds</span>
                    <StatusBadge status={room.has_available_beds ? 'confirmed' : 'completed'} />
                  </div>
                  {room.base_price_monthly && (
                    <p className="room-card__price">PKR {parseInt(room.base_price_monthly).toLocaleString()} / month</p>
                  )}
                  {user?.role === 'student' && (
                    <Button size="sm" style={{ marginTop: 12, width: '100%' }}>
                      <BedDouble size={13} /> Book This Room
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}
