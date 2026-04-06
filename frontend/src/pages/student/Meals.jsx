import { useState, useEffect } from 'react'
import { mealAPI } from '../../api/client'
import { Button, Modal, Input, EmptyState, StatusBadge, Spinner } from '../../components/ui/index.jsx'
import { UtensilsCrossed, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import './meals.css'

export default function Meals() {
  const [plans, setPlans] = useState([])
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSub, setShowSub] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ start_date: '', end_date: '' })
  const [errors, setErrors] = useState({})

  const load = () => {
    setLoading(true)
    Promise.all([mealAPI.getAll(), mealAPI.getSubscriptions()])
      .then(([p, s]) => {
        setPlans(p.data.meal_plans || p.data.plans || [])
        setSubs(s.data.subscriptions || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const subscribedIds = subs.filter((s) => s.status === 'active').map((s) => s.meal_plan_id)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.start_date) errs.start_date = 'Start date required'
    if (!form.end_date) errs.end_date = 'End date required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await mealAPI.subscribe({ meal_plan_id: showSub.meal_plan_id, ...form })
      toast.success(`Subscribed to ${showSub.plan_name}!`)
      setShowSub(null)
      setForm({ start_date: '', end_date: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Subscription failed')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="page-wrapper"><Spinner size="lg" center /></div>

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Meal Plans</h1>
        <p className="page-subtitle">Subscribe to a meal plan that fits your schedule</p>
      </div>

      {subs.length > 0 && (
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <h3 className="section-title" style={{ marginBottom: 14 }}>Your Active Subscriptions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {subs.map((s) => (
              <div key={s.subscription_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-50)' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.plan_name || `Plan #${s.meal_plan_id}`}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{s.start_date?.slice(0,10)} → {s.end_date?.slice(0,10)}</p>
                </div>
                <StatusBadge status={s.status || 'active'} />
              </div>
            ))}
          </div>
        </div>
      )}

      {plans.length === 0
        ? <EmptyState icon={<UtensilsCrossed size={40} />} title="No meal plans available" description="Check back later." />
        : (
          <div className="meal-grid">
            {plans.map((plan) => {
              const isActive = subscribedIds.includes(plan.meal_plan_id)
              return (
                <div key={plan.meal_plan_id} className={`meal-card card ${isActive ? 'meal-card--active' : ''}`}>
                  {isActive && <div className="meal-card__subscribed"><CheckCircle size={14} /> Subscribed</div>}
                  <div className="meal-card__icon">🍽️</div>
                  <h3 className="meal-card__name">{plan.plan_name}</h3>
                  <p className="meal-card__hostel">Hostel #{plan.hostel_id}</p>
                  {plan.description && <p className="meal-card__desc">{plan.description}</p>}
                  <div className="meal-card__price">
                    PKR <strong>{parseInt(plan.price_monthly || plan.monthly_price || 0).toLocaleString()}</strong>/mo
                  </div>
                  <Button
                    variant={isActive ? 'secondary' : 'primary'}
                    size="sm"
                    style={{ width: '100%', marginTop: 12 }}
                    disabled={isActive}
                    onClick={() => !isActive && setShowSub(plan)}>
                    {isActive ? '✓ Active' : 'Subscribe'}
                  </Button>
                </div>
              )
            })}
          </div>
        )
      }

      <Modal open={!!showSub} onClose={() => setShowSub(null)} title={`Subscribe to ${showSub?.plan_name}`} size="sm">
        <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
          <div className="grid-2">
            <Input label="Start Date" type="date" value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })} error={errors.start_date}
              min={new Date().toISOString().slice(0,10)} />
            <Input label="End Date" type="date" value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })} error={errors.end_date}
              min={form.start_date || new Date().toISOString().slice(0,10)} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setShowSub(null)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Confirm Subscription</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
