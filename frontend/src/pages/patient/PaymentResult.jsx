import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const colours = {
    success: { background: 'var(--success, #16a34a)', color: '#fff' },
    error:   { background: 'var(--danger,  #dc2626)', color: '#fff' },
  }

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      padding: '14px 20px', borderRadius: 'var(--radius-sm, 8px)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      fontWeight: 500, fontSize: '0.93rem',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'slideUp 0.25s ease',
      ...colours[type],
    }}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      {message}
      <button
        onClick={onClose}
        style={{
          marginLeft: 8, background: 'transparent', border: 'none',
          color: 'inherit', cursor: 'pointer', fontSize: '1rem', lineHeight: 1,
        }}
      >×</button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PaymentResult
// PayHere redirects here with:
//   /patient/payment/result?appointmentId=xxx              (success)
//   /patient/payment/result?appointmentId=xxx&cancelled=true (cancelled)
// ---------------------------------------------------------------------------
export default function PaymentResult() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()

  const appointmentId = searchParams.get('appointmentId')
  const cancelled     = searchParams.get('cancelled') === 'true'

  const [checking, setChecking] = useState(!cancelled)   // skip DB check if cancelled
  const [toast,    setToast]    = useState(null)
  const [success,  setSuccess]  = useState(false)

  useEffect(() => {
    if (!appointmentId) {
      navigate('/patient/appointments', { replace: true })
      return
    }

    if (cancelled) {
      // Patient cancelled on PayHere — no need to check DB
      setToast({ message: 'Payment was cancelled.', type: 'error' })
      setChecking(false)
      return
    }

    // Poll the payment status from backend to confirm success
    // (PayHere's notify_url hits backend server-to-server; we just read the result)
    let attempts = 0
    const MAX_ATTEMPTS = 6
    const INTERVAL_MS  = 2000   // check every 2 seconds, up to 12 seconds total

    const poll = setInterval(async () => {
      attempts++
      try {
        const res    = await api.getPaymentStatus(appointmentId)
        const status = res.data?.status   // e.g. "SUCCESS", "FAILED", "PENDING"

        if (status === 'SUCCESS') {
          clearInterval(poll)
          setSuccess(true)
          setToast({ message: 'Payment successful! Your appointment is confirmed.', type: 'success' })
          setChecking(false)
        } else if (status === 'FAILED' || status === 'CHARGEBACK') {
          clearInterval(poll)
          setToast({ message: 'Payment failed. Please try again.', type: 'error' })
          setChecking(false)
        } else if (attempts >= MAX_ATTEMPTS) {
          // Still PENDING after polling — notify callback may be delayed
          clearInterval(poll)
          setToast({ message: 'Payment is being processed. Check back shortly.', type: 'error' })
          setChecking(false)
        }
        // else still PENDING → keep polling
      } catch {
        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(poll)
          setToast({ message: 'Could not verify payment status. Please check My Appointments.', type: 'error' })
          setChecking(false)
        }
      }
    }, INTERVAL_MS)

    return () => clearInterval(poll)
  }, [appointmentId, cancelled])  // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-redirect after toast is shown
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => navigate('/patient/appointments'), 4500)
    return () => clearTimeout(t)
  }, [toast, navigate])

  return (
    <div className="page-wrapper">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container" style={{ maxWidth: 480 }}>
        <div className="card" style={{ textAlign: 'center', padding: '48px 32px', marginTop: 40 }}>

          {checking ? (
            <>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', margin: '0 auto 20px',
                border: '3px solid var(--border)',
                borderTop: '3px solid var(--accent)',
                animation: 'spin 0.8s linear infinite',
              }} />
              <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: 8 }}>
                Verifying your payment…
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Please wait, this will only take a moment.
              </div>
            </>
          ) : success ? (
            <>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 8 }}>Payment Successful!</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                Your appointment has been confirmed. Redirecting you back…
              </div>
              <button className="btn btn-accent btn-sm" onClick={() => navigate('/patient/appointments')}>
                Go to My Appointments
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>
                {cancelled ? '🚫' : '❌'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 8 }}>
                {cancelled ? 'Payment Cancelled' : 'Payment Unsuccessful'}
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                {cancelled
                  ? 'You cancelled the payment. Your appointment is still pending.'
                  : 'Something went wrong. Your appointment has not been confirmed.'}
              </div>
              <button className="btn btn-accent btn-sm" onClick={() => navigate('/patient/appointments')}>
                Back to My Appointments
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}