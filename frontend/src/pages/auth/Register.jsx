import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Input, Select, Button } from '../../components/ui/index.jsx'
import { User, Mail, Lock, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '', phone: '', city: '' })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Min 6 characters'
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    if (form.phone && !/^03[0-9]{9}$/.test(form.phone)) e.phone = 'Format: 03XXXXXXXXX'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const { confirm_password, ...data } = form
    const res = await register(data)
    if (res.success) {
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } else {
      toast.error(res.message)
      setErrors({ general: res.message })
    }
  }

  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta']

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">🏠</div>
          <h1 className="auth-brand-name">HostelBuddy</h1>
          <p className="auth-brand-tag">Smart Hostel Management</p>
        </div>
        <p className="auth-tagline">
          Your all-in-one platform for hostel bookings, complaints, maintenance & more — built for Pakistani students.
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Create account</h2>
            <p className="auth-sub">Join HostelBuddy as a student</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <Input label="Full Name" placeholder="Ahmed Khan" value={form.full_name}
              onChange={(e) => set('full_name', e.target.value)} error={errors.full_name}
              icon={<User size={16} />} />
            <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => set('email', e.target.value)} error={errors.email}
              icon={<Mail size={16} />} />
            <div className="grid-2">
              <Input label="Password" type="password" placeholder="••••••••" value={form.password}
                onChange={(e) => set('password', e.target.value)} error={errors.password}
                icon={<Lock size={16} />} />
              <Input label="Confirm Password" type="password" placeholder="••••••••"
                value={form.confirm_password}
                onChange={(e) => set('confirm_password', e.target.value)} error={errors.confirm_password}
                icon={<Lock size={16} />} />
            </div>
            <div className="grid-2">
              <Input label="Phone (optional)" placeholder="03001234567" value={form.phone}
                onChange={(e) => set('phone', e.target.value)} error={errors.phone}
                icon={<Phone size={16} />} />
              <Select label="City (optional)" value={form.city}
                onChange={(e) => set('city', e.target.value)}>
                <option value="">Select city</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>

            {errors.general && <div className="form-alert form-alert--error">{errors.general}</div>}

            <Button type="submit" size="lg" loading={loading} style={{ width: '100%', marginTop: 4 }}>
              Create Account
            </Button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
