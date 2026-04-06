import { useState, useEffect } from 'react'
import { maintenanceAPI } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { Table, Button, Modal, Input, Select, Textarea, EmptyState, StatusBadge, PriorityBadge, Spinner } from '../../components/ui/index.jsx'
import { Plus, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const STATUSES = ['open', 'in_progress', 'resolved', 'closed']

export default function Maintenance() {
  const { isRole } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showStatus, setShowStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({ room_id: '', issue_description: '', priority: 'medium' })
  const [statusForm, setStatusForm] = useState({ status: '' })
  const [errors, setErrors] = useState({})

  const load = () => {
    setLoading(true)
    maintenanceAPI.getAll()
      .then((r) => setRequests(r.data.requests || r.data.maintenance_requests || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.room_id) errs.room_id = 'Room ID required'
    if (!form.issue_description.trim()) errs.issue_description = 'Description required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await maintenanceAPI.create({ ...form, room_id: parseInt(form.room_id) })
      toast.success('Request submitted!')
      setShowCreate(false)
      setForm({ room_id: '', issue_description: '', priority: 'medium' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit')
    } finally { setSubmitting(false) }
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    if (!statusForm.status) { toast.error('Select a status'); return }
    setSubmitting(true)
    try {
      await maintenanceAPI.updateStatus(showStatus.request_id, { status: statusForm.status })
      toast.success('Status updated!')
      setShowStatus(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally { setSubmitting(false) }
  }

  const displayed = filterStatus ? requests.filter((r) => r.status === filterStatus) : requests

  const columns = [
    { key: 'request_id', label: '#', render: (r) => <strong>#{r.request_id}</strong> },
    { key: 'room_id', label: 'Room', render: (r) => `Room #${r.room_id}` },
    { key: 'issue_description', label: 'Issue', render: (r) => <span style={{ maxWidth: 220, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.issue_description}</span> },
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
          <h1 className="page-title">Maintenance Requests</h1>
          <p className="page-subtitle">Report and track room maintenance issues</p>
        </div>
        {isRole('student', 'warden') && (
          <Button onClick={() => setShowCreate(true)}><Plus size={16} /> New Request</Button>
        )}
      </div>

      <div className="filter-bar">
        <select className="form-input form-select" style={{ width: 180 }} value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <span className="results-count">{displayed.length} request{displayed.length !== 1 ? 's' : ''}</span>
      </div>

      {loading
        ? <Spinner size="lg" center />
        : displayed.length === 0
        ? <EmptyState icon={<Wrench size={40} />} title="No maintenance requests"
            action={isRole('student','warden') ? <Button onClick={() => setShowCreate(true)}>Report an Issue</Button> : null} />
        : <Table columns={columns} data={displayed.map((r) => ({ ...r, id: r.request_id }))} />
      }

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Maintenance Request">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
          <Input label="Room ID" type="number" placeholder="Enter room ID" value={form.room_id}
            onChange={(e) => setForm({ ...form, room_id: e.target.value })} error={errors.room_id} />
          <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Textarea label="Issue Description" placeholder="Describe the maintenance issue…" value={form.issue_description}
            onChange={(e) => setForm({ ...form, issue_description: e.target.value })} error={errors.issue_description} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Submit Request</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!showStatus} onClose={() => setShowStatus(null)} title="Update Status" size="sm">
        {showStatus && (
          <form onSubmit={handleStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Room #{showStatus.room_id}: {showStatus.issue_description?.slice(0, 60)}…</p>
            <Select label="New Status" value={statusForm.status} onChange={(e) => setStatusForm({ status: e.target.value })}>
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
