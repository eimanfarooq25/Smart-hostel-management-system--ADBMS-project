import { forwardRef } from 'react'

// ─── Button ─────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  const base = `btn btn-${variant} btn-${size} ${className}`
  return (
    <button className={base} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="spinner" /> : children}
    </button>
  )
}

// ─── Input ──────────────────────────────────────────────
export const Input = forwardRef(({ label, error, icon, className = '', ...props }, ref) => (
  <div className={`form-group ${className}`}>
    {label && <label className="form-label">{label}</label>}
    <div className="input-wrapper">
      {icon && <span className="input-icon">{icon}</span>}
      <input ref={ref} className={`form-input ${icon ? 'has-icon' : ''} ${error ? 'input-error' : ''}`} {...props} />
    </div>
    {error && <span className="form-error">{error}</span>}
  </div>
))
Input.displayName = 'Input'

// ─── Select ─────────────────────────────────────────────
export const Select = forwardRef(({ label, error, children, className = '', ...props }, ref) => (
  <div className={`form-group ${className}`}>
    {label && <label className="form-label">{label}</label>}
    <select ref={ref} className={`form-input form-select ${error ? 'input-error' : ''}`} {...props}>
      {children}
    </select>
    {error && <span className="form-error">{error}</span>}
  </div>
))
Select.displayName = 'Select'

// ─── Textarea ───────────────────────────────────────────
export const Textarea = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className={`form-group ${className}`}>
    {label && <label className="form-label">{label}</label>}
    <textarea ref={ref} className={`form-input form-textarea ${error ? 'input-error' : ''}`} {...props} />
    {error && <span className="form-error">{error}</span>}
  </div>
))
Textarea.displayName = 'Textarea'

// ─── Stat Card ──────────────────────────────────────────
export function StatCard({ label, value, icon, color = 'primary', trend }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__content">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {trend && <p className="stat-card__trend">{trend}</p>}
      </div>
    </div>
  )
}

// ─── Empty State ────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__desc">{description}</p>}
      {action}
    </div>
  )
}

// ─── Loading Spinner ────────────────────────────────────
export function Spinner({ size = 'md', center = false }) {
  return (
    <div className={center ? 'spinner-center' : ''}>
      <div className={`spinner spinner--${size}`} />
    </div>
  )
}

// ─── Modal ──────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal modal--${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

// ─── Table ──────────────────────────────────────────────
export function Table({ columns, data, loading, emptyMessage = 'No records found' }) {
  if (loading) return <div className="table-loading"><Spinner center /></div>
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>{columns.map((col) => <th key={col.key}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.length === 0
            ? <tr><td colSpan={columns.length} className="table-empty">{emptyMessage}</td></tr>
            : data.map((row, i) => (
              <tr key={row.id || i}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

// ─── Priority Badge ─────────────────────────────────────
export function PriorityBadge({ priority }) {
  const map = { low: 'info', medium: 'warning', high: 'error', urgent: 'error' }
  return <span className={`badge badge-${map[priority] || 'neutral'}`}>{priority}</span>
}

// ─── Status Badge ────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    confirmed: 'success', active: 'success', approved: 'success', resolved: 'success', checked_in: 'success',
    pending: 'warning', open: 'warning', in_progress: 'info',
    cancelled: 'neutral', closed: 'neutral', rejected: 'neutral', checked_out: 'neutral',
    completed: 'info',
  }
  return <span className={`badge badge-${map[status] || 'neutral'}`}>{status?.replace('_', ' ')}</span>
}
