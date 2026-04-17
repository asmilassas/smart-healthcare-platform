import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api'
import './AuthPages.css'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role
      }

      const res = await api.register(payload)

      localStorage.setItem('verify_email', payload.email)

      setSuccess(
        res?.data?.message ||
          (form.role === 'doctor'
            ? 'Doctor registered successfully. OTP sent to your email. Waiting for admin approval.'
            : 'Patient registered successfully. OTP sent to your email.')
      )

      setTimeout(() => {
        navigate('/verify-otp')
      }, 1000)
    } catch (err) {
      if (err.response) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.')
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

        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Register to continue to the healthcare platform</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              className="input-field"
              type="text"
              name="name"
              placeholder="Enter your name"
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
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Register as</label>
            <select
              className="input-field"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {form.role === 'doctor' && (
            <div className="info-msg">
              Doctor accounts require admin approval after OTP verification.
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <button
            className="btn btn-primary btn-lg auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  )
}