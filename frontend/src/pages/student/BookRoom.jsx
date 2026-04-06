import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { hostelAPI, amenityAPI, bookingAPI } from '../../api/client'
import { Input, Button, Spinner } from '../../components/ui/index.jsx'
import { ArrowLeft, CheckCircle, XCircle, BedDouble, Package, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import './booking.css'

const STEPS = ['Select Bed', 'Add Amenities', 'Review & Confirm', 'Result']

export default function BookRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [beds, setBeds] = useState([])
  const [amenities, setAmenities] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const [form, setForm] = useState({
    bed_id: '',
    booking_start_date: '',
    booking_end_date: '',
    amenity_ids: [],
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    Promise.all([hostelAPI.getAvailableBeds(roomId), amenityAPI.getAll()])
      .then(([b, a]) => {
        setBeds(b.data.beds || b.data || [])
        setAmenities(a.data.amenities || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [roomId])

  const toggleAmenity = (id) => {
    setForm((f) => ({
      ...f,
      amenity_ids: f.amenity_ids.includes(id)
        ? f.amenity_ids.filter((x) => x !== id)
        : [...f.amenity_ids, id],
    }))
  }

  const validateStep0 = () => {
    const e = {}
    if (!form.bed_id) e.bed_id = 'Please select a bed'
    if (!form.booking_start_date) e.booking_start_date = 'Start date required'
    if (!form.booking_end_date) e.booking_end_date = 'End date required'
    if (form.booking_start_date && form.booking_end_date) {
      if (new Date(form.booking_end_date) <= new Date(form.booking_start_date))
        e.booking_end_date = 'End date must be after start date'
    }
    return e
  }

  const calcNights = () => {
    if (!form.booking_start_date || !form.booking_end_date) return 0
    return Math.ceil((new Date(form.booking_end_date) - new Date(form.booking_start_date)) / 86400000)
  }

  const selectedBed = beds.find((b) => String(b.bed_id) === String(form.bed_id))
  const selectedAmenitiesData = amenities.filter((a) => form.amenity_ids.includes(a.amenity_id))
  const nights = calcNights()
  const months = (nights / 30).toFixed(2)

  const handleSubmit = async () => {
    setSubmitting(true)
    setStep(3)
    try {
      const res = await bookingAPI.create({
        bed_id: parseInt(form.bed_id),
        booking_start_date: form.booking_start_date,
        booking_end_date: form.booking_end_date,
        amenity_ids: form.amenity_ids,
      })
      setResult({ success: true, data: res.data })
      toast.success('Booking confirmed!')
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Booking failed. The transaction was rolled back.'
      setResult({ success: false, message: msg })
      toast.error('Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="page-wrapper"><Spinner size="lg" center /></div>

  return (
    <div className="page-wrapper">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>
        <ArrowLeft size={15} /> Back
      </button>

      <div className="page-header">
        <h1 className="page-title">Book a Room</h1>
        <p className="page-subtitle">Secured by ACID transaction — your booking is guaranteed atomic.</p>
      </div>

      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((s, i) => (
          <div key={s} className={`stepper-item ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
            <div className="stepper-circle">{i < step ? '✓' : i + 1}</div>
            <span className="stepper-label">{s}</span>
            {i < STEPS.length - 1 && <div className="stepper-line" />}
          </div>
        ))}
      </div>

      <div className="booking-card card">
        {/* Step 0: Bed + Dates */}
        {step === 0 && (
          <div className="booking-step">
            <h3 className="booking-step__title"><BedDouble size={18} /> Select Bed & Dates</h3>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Available Bed</label>
              {beds.length === 0
                ? <p className="text-muted">No available beds in this room.</p>
                : (
                  <div className="bed-grid">
                    {beds.map((bed) => (
                      <button key={bed.bed_id} type="button"
                        className={`bed-btn ${String(form.bed_id) === String(bed.bed_id) ? 'bed-btn--selected' : ''}`}
                        onClick={() => setForm((f) => ({ ...f, bed_id: bed.bed_id }))}>
                        🛏️ Bed #{bed.bed_number || bed.bed_id}
                      </button>
                    ))}
                  </div>
                )
              }
              {errors.bed_id && <span className="form-error">{errors.bed_id}</span>}
            </div>

            <div className="grid-2">
              <Input label="Check-in Date" type="date" value={form.booking_start_date}
                onChange={(e) => setForm((f) => ({ ...f, booking_start_date: e.target.value }))}
                error={errors.booking_start_date} icon={<Calendar size={15} />}
                min={new Date().toISOString().slice(0, 10)} />
              <Input label="Check-out Date" type="date" value={form.booking_end_date}
                onChange={(e) => setForm((f) => ({ ...f, booking_end_date: e.target.value }))}
                error={errors.booking_end_date} icon={<Calendar size={15} />}
                min={form.booking_start_date || new Date().toISOString().slice(0, 10)} />
            </div>

            {nights > 0 && (
              <div className="stay-info">
                <span>📅 {nights} nights</span>
                <span>·</span>
                <span style={{ color: nights < 30 ? '#E5521C' : '#10B981' }}>
                  {nights < 30 ? '⚠ Short-stay (must be Floor 1-2)' : '✓ Long-stay (Floor 3+)'}
                </span>
              </div>
            )}

            <div className="step-actions">
              <Button onClick={() => {
                const e = validateStep0()
                if (Object.keys(e).length) { setErrors(e); return }
                setErrors({})
                setStep(1)
              }}>Continue →</Button>
            </div>
          </div>
        )}

        {/* Step 1: Amenities */}
        {step === 1 && (
          <div className="booking-step">
            <h3 className="booking-step__title"><Package size={18} /> Select Amenities (Optional)</h3>
            <p className="booking-step__sub">Add amenities to enhance your stay. Prices are monthly.</p>

            <div className="amenity-grid">
              {amenities.map((a) => (
                <button key={a.amenity_id} type="button"
                  className={`amenity-btn ${form.amenity_ids.includes(a.amenity_id) ? 'amenity-btn--selected' : ''}`}
                  onClick={() => toggleAmenity(a.amenity_id)}>
                  <div className="amenity-btn__check">{form.amenity_ids.includes(a.amenity_id) ? '✓' : '+'}</div>
                  <p className="amenity-btn__name">{a.amenity_name}</p>
                  <span className={`badge badge-neutral amenity-cat`}>{a.category}</span>
                  <p className="amenity-btn__price">PKR {parseInt(a.base_price_monthly).toLocaleString()}/mo</p>
                </button>
              ))}
            </div>
            {amenities.length === 0 && <p className="text-muted">No amenities available.</p>}

            <div className="step-actions">
              <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
              <Button onClick={() => setStep(2)}>Continue →</Button>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="booking-step">
            <h3 className="booking-step__title">📋 Review Your Booking</h3>
            <p className="booking-step__sub">This action uses an ACID transaction — either everything succeeds or nothing changes.</p>

            <div className="review-box">
              <div className="review-row">
                <span>Bed</span>
                <strong>#{selectedBed?.bed_number || form.bed_id}</strong>
              </div>
              <div className="review-row">
                <span>Check-in</span>
                <strong>{form.booking_start_date}</strong>
              </div>
              <div className="review-row">
                <span>Check-out</span>
                <strong>{form.booking_end_date}</strong>
              </div>
              <div className="review-row">
                <span>Duration</span>
                <strong>{nights} nights ({months} months)</strong>
              </div>
              {selectedAmenitiesData.length > 0 && (
                <div className="review-row">
                  <span>Amenities</span>
                  <strong>{selectedAmenitiesData.map((a) => a.amenity_name).join(', ')}</strong>
                </div>
              )}
              <div className="review-divider" />
              <div className="review-row review-row--total">
                <span>Estimated Monthly</span>
                <strong className="text-primary">
                  PKR {(
                    selectedAmenitiesData.reduce((sum, a) => sum + parseFloat(a.base_price_monthly || 0), 0)
                  ).toLocaleString()} (amenities)
                </strong>
              </div>
            </div>

            <div className="acid-note">
              <strong>🔒 ACID Transaction Note:</strong> If the bed becomes unavailable between now and confirmation, or if any amenity check fails, the entire booking will be rolled back automatically — no partial state.
            </div>

            <div className="step-actions">
              <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
              <Button onClick={handleSubmit} loading={submitting}>
                Confirm Booking
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 3 && (
          <div className="booking-step booking-result">
            {submitting
              ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spinner size="lg" center />
                  <p style={{ marginTop: 16, color: 'var(--gray-500)' }}>Processing transaction…</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginTop: 6 }}>Locking bed row · Validating availability · Inserting booking</p>
                </div>
              )
              : result?.success
              ? (
                <div className="result-success">
                  <CheckCircle size={56} color="var(--success)" />
                  <h3>Booking Confirmed!</h3>
                  <p>Transaction committed successfully. Your booking ID is <strong>#{result.data?.booking?.booking_id}</strong>.</p>
                  {result.data?.pricing && (
                    <div className="result-pricing">
                      <div><span>Base Price</span><strong>PKR {parseInt(result.data.pricing.base_price || 0).toLocaleString()}</strong></div>
                      <div><span>Amenities</span><strong>PKR {parseInt(result.data.pricing.amenities_price || 0).toLocaleString()}</strong></div>
                      <div className="total-row"><span>Total</span><strong>PKR {parseInt(result.data.pricing.total_cost || 0).toLocaleString()}</strong></div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <Button onClick={() => navigate('/bookings')}>My Bookings</Button>
                    <Button variant="secondary" onClick={() => navigate('/hostels')}>Browse More</Button>
                  </div>
                </div>
              )
              : (
                <div className="result-fail">
                  <XCircle size={56} color="var(--error)" />
                  <h3>Booking Failed</h3>
                  <p>{result?.message}</p>
                  <p className="result-rollback">↩ Transaction rolled back — no changes were made to the database.</p>
                  <Button onClick={() => { setStep(0); setResult(null) }}>Try Again</Button>
                </div>
              )
            }
          </div>
        )}
      </div>
    </div>
  )
}
