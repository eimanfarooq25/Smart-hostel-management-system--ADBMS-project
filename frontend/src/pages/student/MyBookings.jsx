import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI } from '../../api/client'
import { Table, EmptyState, StatusBadge, Button, Spinner } from '../../components/ui/index.jsx'
import { BedDouble, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MyBookings() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  const load = () => {
    setLoading(true)
    bookingAPI.getAll()
      .then((r) => setBookings(r.data.bookings || []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking? (Only allowed within 24 hours of booking.)')) return
    setCancelling(id)
    try {
      await bookingAPI.cancel(id)
      toast.success('Booking cancelled.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot cancel booking')
    } finally {
      setCancelling(null)
    }
  }

  const columns = [
    { key: 'booking_id', label: '#', render: (r) => <strong>#{r.booking_id}</strong> },
    { key: 'bed_id', label: 'Bed', render: (r) => `Bed #${r.bed_id}` },
    { key: 'booking_start_date', label: 'Start', render: (r) => r.booking_start_date?.slice(0,10) },
    { key: 'booking_end_date', label: 'End', render: (r) => r.booking_end_date?.slice(0,10) },
    { key: 'stay_category', label: 'Type', render: (r) => r.stay_category || '—' },
    { key: 'base_price', label: 'Base Price', render: (r) => r.base_price ? `PKR ${parseInt(r.base_price).toLocaleString()}` : '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '', render: (r) => (
        r.status === 'confirmed' || r.status === 'pending'
          ? <Button variant="danger" size="sm" loading={cancelling === r.booking_id}
              onClick={() => handleCancel(r.booking_id)}>Cancel</Button>
          : null
      )
    },
  ]

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">All your hostel room bookings</p>
        </div>
        <Button onClick={() => navigate('/hostels')}>
          <Plus size={16} /> New Booking
        </Button>
      </div>

      {loading
        ? <Spinner size="lg" center />
        : bookings.length === 0
        ? <EmptyState icon={<BedDouble size={40} />} title="No bookings yet"
            description="Browse hostels and book your first room."
            action={<Button onClick={() => navigate('/hostels')}>Browse Hostels</Button>} />
        : <Table columns={columns} data={bookings.map((b) => ({ ...b, id: b.booking_id }))} />
      }
    </div>
  )
}
