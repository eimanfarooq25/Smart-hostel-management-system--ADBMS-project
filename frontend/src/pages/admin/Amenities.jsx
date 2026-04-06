import { useState, useEffect } from 'react'
import { amenityAPI } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { Table, Button, Modal, Input, Select, EmptyState, Spinner } from '../../components/ui/index.jsx'
import { Plus, Package, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['comfort', 'utility', 'service', 'entertainment']

const EMPTY = { amenity_name: '', description: '', base_price_monthly: '', category: '' }

export default function Amenities() {
  const { isRole } = useAuth()
  const [amenities, setAmenities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  const load = () => {
    setLoading(true)
    amenityAPI.getAll()
      .then((r) => setAmenities(r.data.amenities || []))
      .catch(() => toast.error('Failed to load amenities'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const validate = () => {
    const e = {}
    if (!form.amenity_name.trim()) e.amenity_name = 'Name required'
    if (!form.base_price_monthly || isNaN(form.base_price_monthly) || parseFloat(form.base_price_monthly) < 0) e.base_price_monthly = 'Valid price required'
    if (!form.category) e.category = 'Category required'
    return e
  }

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setShowModal(true) }
  const openEdit = (a) => { setEditing(a); setForm({ amenity_name: a.amenity_name, description: a.description || '', base_price_monthly: a.base_price_monthly, category: a.category }); setErrors({}); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      if (editing) {
        await amenityAPI.update(editing.amenity_id, form)
        toast.success('Amenity updated!')
      } else {
        await amenityAPI.create(form)
        toast.success('Amenity created!')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this amenity? This cannot be undone.')) return
    setDeleting(id)
    try {
      await amenityAPI.delete(id)
      toast.success('Amenity deleted.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot delete')
    } finally { setDeleting(null) }
  }

  const catColor = { comfort: 'info', utility: 'warning', service: 'success', entertainment: 'primary' }

  const columns = [
    { key: 'amenity_id', label: '#', render: (r) => <strong>#{r.amenity_id}</strong> },
    { key: 'amenity_name', label: 'Name', render: (r) => <span style={{ fontWeight: 600 }}>{r.amenity_name}</span> },
    { key: 'category', label: 'Category', render: (r) => <span className={`badge badge-${catColor[r.category] || 'neutral'}`}>{r.category}</span> },
    { key: 'base_price_monthly', label: 'Monthly Price', render: (r) => `PKR ${parseInt(r.base_price_monthly).toLocaleString()}` },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="sm" variant="outline" onClick={() => openEdit(r)}><Pencil size={13} /></Button>
          {isRole('super_admin') && (
            <Button size="sm" variant="danger" loading={deleting === r.amenity_id} onClick={() => handleDelete(r.amenity_id)}><Trash2 size={13} /></Button>
          )}
        </div>
      )
    },
  ]

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Amenities</h1>
          <p className="page-subtitle">Manage available amenities for hostel bookings</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add Amenity</Button>
      </div>

      {loading
        ? <Spinner size="lg" center />
        : amenities.length === 0
        ? <EmptyState icon={<Package size={40} />} title="No amenities yet" action={<Button onClick={openCreate}>Add First Amenity</Button>} />
        : <Table columns={columns} data={amenities.map((a) => ({ ...a, id: a.amenity_id }))} />
      }

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Amenity' : 'Add Amenity'} size="sm">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
          <Input label="Amenity Name" placeholder="e.g. WiFi, AC, Laundry" value={form.amenity_name}
            onChange={(e) => setForm({ ...form, amenity_name: e.target.value })} error={errors.amenity_name} />
          <div className="grid-2">
            <Input label="Monthly Price (PKR)" type="number" placeholder="0" value={form.base_price_monthly}
              onChange={(e) => setForm({ ...form, base_price_monthly: e.target.value })} error={errors.base_price_monthly} />
            <Select label="Category" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })} error={errors.category}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
