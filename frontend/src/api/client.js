import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hb_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === 'ECONNABORTED' || !err.response) {
      toast.error('Cannot reach server. Is the backend running?')
      return Promise.reject(err)
    }
    if (err.response?.status === 401) {
      localStorage.removeItem('hb_token')
      localStorage.removeItem('hb_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  profile: () => api.get('/auth/profile'),
}

// ─── Hostels ────────────────────────────────────────────
export const hostelAPI = {
  getAll: (params) => api.get('/hostels', { params }),
  getById: (id) => api.get(`/hostels/${id}`),
  getRooms: (hostelId, params) => api.get(`/hostels/${hostelId}/rooms`, { params }),
  getAvailableBeds: (roomId) => api.get(`/hostels/rooms/${roomId}/beds`),
}

// ─── Bookings ───────────────────────────────────────────
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.delete(`/bookings/${id}`),
}

// ─── Amenities ──────────────────────────────────────────
export const amenityAPI = {
  getAll: () => api.get('/amenities'),
  getById: (id) => api.get(`/amenities/${id}`),
  create: (data) => api.post('/amenities', data),
  update: (id, data) => api.put(`/amenities/${id}`, data),
  delete: (id) => api.delete(`/amenities/${id}`),
}

// ─── Meals ──────────────────────────────────────────────
export const mealAPI = {
  getAll: (params) => api.get('/meals', { params }),
  subscribe: (data) => api.post('/meals/subscribe', data),
  getSubscriptions: () => api.get('/meals/subscriptions'),
}

// ─── Complaints ─────────────────────────────────────────
export const complaintAPI = {
  submit: (data) => api.post('/complaints', data),
  getAll: () => api.get('/complaints'),
  getById: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
}

// ─── Maintenance ────────────────────────────────────────
export const maintenanceAPI = {
  create: (data) => api.post('/maintenance', data),
  getAll: () => api.get('/maintenance'),
  getById: (id) => api.get(`/maintenance/${id}`),
  updateStatus: (id, data) => api.put(`/maintenance/${id}/status`, data),
}

// ─── Guests ─────────────────────────────────────────────
export const guestAPI = {
  register: (data) => api.post('/guests', data),
  getAll: () => api.get('/guests'),
  getById: (id) => api.get(`/guests/${id}`),
  updateStatus: (id, data) => api.put(`/guests/${id}/status`, data),
}

export default api
