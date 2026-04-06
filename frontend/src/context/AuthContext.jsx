import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hb_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('hb_token')
    if (token) {
      authAPI.profile()
        .then((res) => {
          const u = res.data.user
          setUser(u)
          localStorage.setItem('hb_user', JSON.stringify(u))
        })
        .catch(() => {
          localStorage.removeItem('hb_token')
          localStorage.removeItem('hb_user')
          setUser(null)
        })
        .finally(() => setInitializing(false))
    } else {
      setInitializing(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const res = await authAPI.login({ email, password })
      const { token, user: u } = res.data
      localStorage.setItem('hb_token', token)
      localStorage.setItem('hb_user', JSON.stringify(u))
      setUser(u)
      return { success: true, user: u }
    } catch (err) {
      return { success: false, message: err.response?.data?.error || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data) => {
    setLoading(true)
    try {
      const res = await authAPI.register(data)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, message: err.response?.data?.error || 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('hb_token')
    localStorage.removeItem('hb_user')
    setUser(null)
  }, [])

  const isRole = (...roles) => roles.includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, loading, initializing, login, register, logout, isRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
