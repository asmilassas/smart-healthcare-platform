import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api'
import './AuthPages.css'

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const savedEmail = localStorage.getItem('verify_email') || ''
    setEmail(savedEmail)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!email) {
        setError('Missing email. Please register again.')
        setLoading(false)
        return
      }

      const res = await api.verifyOtp({
        email: email.trim(),
        otp: otp.trim()
      })

      setSuccess(res?.data?.message || 'Account verified successfully.')

      localStorage.removeItem('verify_email')

      setTimeout(() => {
        navigate('/login')
      }, 1000)
    } catch (err) {
      if (err.response) {
        setError(err.response?.data?.message || 'OTP verification failed.')
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

        <h1 className="auth-title">Verify OTP</h1>
        <p className="auth-sub">
          Enter the OTP sent to your email
        </p>

        {email && (
          <div className="info-msg">
            Verifying: <strong>{email}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">One-Time Password</label>
            <input
              className="input-field"
              type="text"
              name="otp"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <button
            className="btn btn-primary btn-lg auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <p className="auth-switch">
          Back to <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}