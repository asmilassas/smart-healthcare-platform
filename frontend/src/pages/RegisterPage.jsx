import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import './AuthPages.css'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.register(form)
      const { user, token } = res.data
      login(user, token)
      if (user.role === 'patient') navigate('/patient')
      else if (user.role === 'doctor') navigate('/doctor')
      else navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
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
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Join MediConnect to get started</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              className="input-field"
              type="text"
              name="name"
              placeholder="Dr. Kamal Perera / Nimal Silva"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
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
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label className="form-label">I am a…</label>
            <select
              className="select-field"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button
            className="btn btn-primary btn-lg auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
