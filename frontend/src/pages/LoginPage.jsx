import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import './AuthPages.css'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const redirectByRole = (role) => {
    const normalizedRole = String(role || '').toLowerCase()

    if (normalizedRole === 'patient') navigate('/patient')
    else if (normalizedRole === 'doctor') navigate('/doctor')
    else if (normalizedRole === 'admin') navigate('/admin')
    else navigate('/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        email: form.email.trim(),
        password: form.password
      }

      const res = await api.login(payload)
      const user = res?.data?.user
      const token = res?.data?.token

      if (!user || !token) {
        setError('Invalid login response from server.')
        return
      }

      login(user, token)
      redirectByRole(user.role)
    } catch (err) {
      if (err.response) {
        const status = err.response.status
        const message = err.response?.data?.message || 'Login failed. Please try again.'
        const lowerMessage = message.toLowerCase()

        if (lowerMessage.includes('verify otp') || lowerMessage.includes('verify your account') || lowerMessage.includes('verify')) {
          localStorage.setItem('verify_email', form.email.trim())
        }

        if (status === 403 && lowerMessage.includes('pending admin approval')) {
          setError('Your doctor account is waiting for admin approval.')
        } else if (status === 403 && lowerMessage.includes('rejected')) {
          setError('Your doctor account was rejected by admin.')
        } else {
          setError(message)
        }
      } else if (err.request) {
        setError('Cannot connect to server. Please make sure auth service is running.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <span className="brand-icon">✚</span>
          MediConnect
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="input-field"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="input-field"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button
            className="btn btn-primary btn-lg auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one →</Link>
        </p>

        {error.toLowerCase().includes('verify') && (
          <p className="auth-switch">
            Need to verify your account? <Link to="/verify-otp">Go to OTP page</Link>
          </p>
        )}
      </div>
    </div>
  )
}