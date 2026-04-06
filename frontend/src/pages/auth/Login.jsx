import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Input, Button } from '../../components/ui/index.jsx'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import './auth.css'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})

    const res = await login(form.email, form.password)
    if (res.success) {
      toast.success(`Welcome back, ${res.user.full_name?.split(' ')[0]}!`)
      navigate('/dashboard')
    } else {
      toast.error(res.message)
      setErrors({ general: res.message })
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">🏠</div>
          <h1 className="auth-brand-name">HostelBuddy</h1>
          <p className="auth-brand-tag">Smart Hostel Management</p>
        </div>
        <div className="auth-features">
          {['Book rooms with real-time availability', 'Manage complaints & maintenance', 'Track meal plans & guests', 'Full RBAC — every role gets their view'].map((f) => (
            <div key={f} className="auth-feature"><span className="auth-feature-dot">✦</span>{f}</div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-sub">Sign in to your HostelBuddy account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              icon={<Mail size={16} />}
            />
            <div className="password-group">
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                icon={<Lock size={16} />}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errors.general && <div className="form-alert form-alert--error">{errors.general}</div>}

            <Button type="submit" size="lg" loading={loading} style={{ width: '100%', marginTop: 4 }}>
              Sign In
            </Button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
          </p>

          <div className="auth-demo">
            <p className="auth-demo-title">Demo Credentials</p>
            <div className="auth-demo-grid">
              {[
                { role: 'Student', email: 'student@example.com', pw: 'password123' },
                { role: 'Warden', email: 'warden@example.com', pw: 'password123' },
              ].map((d) => (
                <button key={d.role} className="auth-demo-btn"
                  onClick={() => setForm({ email: d.email, password: d.pw })}>
                  <strong>{d.role}</strong>
                  <span>{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
