import { useState, useEffect } from 'react'
import { guestAPI } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { Table, Button, Modal, Input, Select, EmptyState, StatusBadge, Spinner } from '../../components/ui/index.jsx'
import { Plus, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES = ['approved', 'rejected', 'checked_in', 'checked_out']

export default function Guests() {
  const { isRole } = useAuth()
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showStatus, setShowStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ guest_name: '', guest_phone: '', relationship: '', check_in_date: '', check_out_date: '' })
  const [statusForm, setStatusForm] = useState({ status: '' })
  const [errors, setErrors] = useState({})

  const load = () => {
    setLoading(true)
    guestAPI.getAll()
      .then((r) => setGuests(r.data.registrations || r.data.guests || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const validate = () => {
    const e = {}
    if (!form.guest_name.trim()) e.guest_name = 'Guest name required'
    if (!form.relationship.trim()) e.relationship = 'Relationship required'
    if (!form.check_in_date) e.check_in_date = 'Check-in date required'
    if (!form.check_out_date) e.check_out_date = 'Check-out date required'
    if (form.guest_phone && !/^03[0-9]{9}$/.test(form.guest_phone)) e.guest_phone = 'Format: 03XXXXXXXXX'
    return e
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await guestAPI.register(form)
      toast.success('Guest registered! Awaiting approval.')
      setShowCreate(false)
      setForm({ guest_name: '', guest_phone: '', relationship: '', check_in_date: '', check_out_date: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to register guest')
    } finally { setSubmitting(false) }
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    if (!statusForm.status) { toast.error('Select a status'); return }
    setSubmitting(true)
    try {
      await guestAPI.updateStatus(showStatus.guest_id, { status: statusForm.status })
      toast.success('Status updated!')
      setShowStatus(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally { setSubmitting(false) }
  }

  const columns = [
    { key: 'guest_id', label: '#', render: (r) => <strong>#{r.guest_id}</strong> },
    { key: 'guest_name', label: 'Guest Name' },
    { key: 'relationship', label: 'Relationship' },
    { key: 'guest_phone', label: 'Phone', render: (r) => r.guest_phone || '—' },
    { key: 'check_in_date', label: 'Check-in', render: (r) => r.check_in_date?.slice(0,10) },
    { key: 'check_out_date', label: 'Check-out', render: (r) => r.check_out_date?.slice(0,10) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status || 'pending'} /> },
    {
      key: 'actions', label: '',
      render: (r) => isRole('warden', 'super_admin')
        ? <Button size="sm" variant="outline" onClick={() => { setShowStatus(r); setStatusForm({ status: r.status || 'approved' }) }}>Approve</Button>
        : null
    },
  ]

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Guest Registrations</h1>
          <p className="page-subtitle">{isRole('student') ? 'Register guests visiting you' : 'Manage incoming guest approvals'}</p>
        </div>
        {isRole('student') && (
          <Button onClick={() => setShowCreate(true)}><Plus size={16} /> Register Guest</Button>
        )}
      </div>

      {loading
        ? <Spinner size="lg" center />
        : guests.length === 0
        ? <EmptyState icon={<Users size={40} />} title="No guest registrations"
            action={isRole('student') ? <Button onClick={() => setShowCreate(true)}>Register a Guest</Button> : null} />
        : <Table columns={columns} data={guests.map((g) => ({ ...g, id: g.guest_id }))} />
      }

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Register a Guest">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
          <div className="grid-2">
            <Input label="Guest Name" placeholder="Full name" value={form.guest_name}
              onChange={(e) => setForm({ ...form, guest_name: e.target.value })} error={errors.guest_name} />
            <Input label="Phone (optional)" placeholder="03XXXXXXXXX" value={form.guest_phone}
              onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} error={errors.guest_phone} />
          </div>
          <Input label="Relationship" placeholder="e.g. Parent, Sibling, Friend" value={form.relationship}
            onChange={(e) => setForm({ ...form, relationship: e.target.value })} error={errors.relationship} />
          <div className="grid-2">
            <Input label="Check-in Date" type="date" value={form.check_in_date}
              onChange={(e) => setForm({ ...form, check_in_date: e.target.value })} error={errors.check_in_date}
              min={new Date().toISOString().slice(0,10)} />
            <Input label="Check-out Date" type="date" value={form.check_out_date}
              onChange={(e) => setForm({ ...form, check_out_date: e.target.value })} error={errors.check_out_date}
              min={form.check_in_date || new Date().toISOString().slice(0,10)} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Register Guest</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!showStatus} onClose={() => setShowStatus(null)} title="Update Guest Status" size="sm">
        {showStatus && (
          <form onSubmit={handleStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
              <strong>{showStatus.guest_name}</strong> — {showStatus.relationship}
            </p>
            <Select label="Status" value={statusForm.status} onChange={(e) => setStatusForm({ status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </Select>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button type="button" variant="secondary" onClick={() => setShowStatus(null)}>Cancel</Button>
              <Button type="submit" loading={submitting}>Update</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
