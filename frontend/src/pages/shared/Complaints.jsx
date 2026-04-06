import { useState, useEffect } from 'react'
import { complaintAPI, hostelAPI } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { Table, Button, Modal, Input, Select, Textarea, EmptyState, StatusBadge, PriorityBadge, Spinner } from '../../components/ui/index.jsx'
import { Plus, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['cleanliness', 'noise', 'staff', 'maintenance', 'food', 'security', 'other']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const STATUSES = ['open', 'in_progress', 'resolved', 'closed']

export default function Complaints() {
  const { user, isRole } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showStatus, setShowStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const [form, setForm] = useState({ hostel_id: '', category: '', subject: '', description: '', priority: 'medium' })
  const [statusForm, setStatusForm] = useState({ status: '' })
  const [errors, setErrors] = useState({})

  const load = () => {
    setLoading(true)
    const calls = [complaintAPI.getAll()]
    if (isRole('student')) calls.push(hostelAPI.getAll())
    Promise.all(calls)
      .then(([c, h]) => {
        setComplaints(c.data.complaints || [])
        if (h) setHostels(h.data.hostels || [])
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const validate = () => {
    const e = {}
    if (!form.hostel_id) e.hostel_id = 'Select a hostel'
    if (!form.category) e.category = 'Select a category'
    if (!form.subject.trim()) e.subject = 'Subject required'
    if (!form.description.trim()) e.description = 'Description required'
    return e
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await complaintAPI.submit({ ...form, hostel_id: parseInt(form.hostel_id) })
      toast.success('Complaint submitted!')
      setShowCreate(false)
      setForm({ hostel_id: '', category: '', subject: '', description: '', priority: 'medium' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit')
    } finally {
      setSubmitting(false) }
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    if (!statusForm.status) { toast.error('Select a status'); return }
    setSubmitting(true)
    try {
      await complaintAPI.updateStatus(showStatus.complaint_id, { status: statusForm.status })
      toast.success('Status updated!')
      setShowStatus(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    } finally {
      setSubmitting(false) }
  }

  const displayed = complaints.filter((c) => {
    const matchSearch = !search || c.subject?.toLowerCase().includes(search.toLowerCase()) || c.category?.includes(search.toLowerCase())
    const matchStatus = !filterStatus || c.status === filterStatus
    return matchSearch && matchStatus
  })

  const columns = [
    { key: 'complaint_id', label: '#', render: (r) => <strong>#{r.complaint_id}</strong> },
    { key: 'subject', label: 'Subject', render: (r) => <span style={{ fontWeight: 500 }}>{r.subject}</span> },
    { key: 'category', label: 'Category', render: (r) => <span className="badge badge-neutral">{r.category}</span> },
    { key: 'priority', label: 'Priority', render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'created_at', label: 'Filed', render: (r) => r.created_at?.slice(0,10) || '—' },
    {
      key: 'actions', label: '',
      render: (r) => isRole('warden', 'super_admin')
        ? <Button size="sm" variant="outline" onClick={() => { setShowStatus(r); setStatusForm({ status: r.status }) }}>Update</Button>
        : null
    },
  ]

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Complaints</h1>
          <p className="page-subtitle">{isRole('student') ? 'Track your filed complaints' : 'Manage all hostel complaints'}</p>
        </div>
        {isRole('student') && (
          <Button onClick={() => setShowCreate(true)}><Plus size={16} /> File Complaint</Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <input className="form-input" placeholder="Search complaints…" value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 14 }} />
        </div>
        <select className="form-input form-select" style={{ width: 160 }} value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
      </div>

      {loading
        ? <Spinner size="lg" center />
        : displayed.length === 0
        ? <EmptyState icon={<AlertCircle size={40} />} title="No complaints found"
            action={isRole('student') ? <Button onClick={() => setShowCreate(true)}>File a Complaint</Button> : null} />
        : <Table columns={columns} data={displayed.map((c) => ({ ...c, id: c.complaint_id }))} />
      }

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="File a Complaint">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
          <Select label="Hostel" value={form.hostel_id} onChange={(e) => setForm({ ...form, hostel_id: e.target.value })} error={errors.hostel_id}>
            <option value="">Select hostel</option>
            {hostels.map((h) => <option key={h.hostel_id} value={h.hostel_id}>{h.hostel_name}</option>)}
          </Select>
          <div className="grid-2">
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} error={errors.category}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
          <Input label="Subject" placeholder="Brief summary of the issue" value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })} error={errors.subject} />
          <Textarea label="Description" placeholder="Describe the issue in detail…" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} error={errors.description} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Submit Complaint</Button>
          </div>
        </form>
      </Modal>

      {/* Status Update Modal */}
      <Modal open={!!showStatus} onClose={() => setShowStatus(null)} title="Update Complaint Status" size="sm">
        {showStatus && (
          <form onSubmit={handleStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}><strong>{showStatus.subject}</strong></p>
            <Select label="New Status" value={statusForm.status} onChange={(e) => setStatusForm({ status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </Select>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button type="button" variant="secondary" onClick={() => setShowStatus(null)}>Cancel</Button>
              <Button type="submit" loading={submitting}>Update Status</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
