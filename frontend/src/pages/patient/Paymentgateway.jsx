import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

const PAYHERE_CHECKOUT_URL = 'https://sandbox.payhere.lk/pay/checkout'

export default function PaymentGateway() {
  const { state } = useLocation()
  const navigate  = useNavigate()
  const { user } = useAuth()

  // state passed from MyAppointments: { appointmentId, amount, doctorName, specialty, appointmentDate, timeSlot, type }
  const [initiating, setInitiating] = useState(true)
  const [error,      setError]      = useState('')
  const [payHereData, setPayHereData] = useState(null)   // PaymentInitiateResponseDTO fields

  const formRef = useRef(null)

  // Redirect away if navigated here directly without state
  useEffect(() => {
    if (!state?.appointmentId) {
      navigate('/patient/appointments', { replace: true })
    }
  }, [state, navigate])

  // Call initiate on mount, then auto-submit the PayHere form
  useEffect(() => {
    if (!state?.appointmentId) return
    if (!user) return

    api.initiatePayment({
      appointmentId: state.appointmentId,
      amount:        state.amount,
      patientId:     user.id
    })
      .then(res => {
        setPayHereData(res.data)
        setInitiating(false)
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Could not initiate payment. Please try again.'
        setError(msg)
        setInitiating(false)
      })
  }, [user])   // eslint-disable-line react-hooks/exhaustive-deps

  // Once payHereData is set and form is rendered, submit it automatically
  useEffect(() => {
    if (payHereData && formRef.current) {
      formRef.current.submit()
    }
  }, [payHereData])

  if (!state?.appointmentId) return null

  const { appointmentId, amount, doctorName, specialty, appointmentDate, timeSlot, type } = state

  const rows = [
    ['Doctor',    doctorName],
    ['Specialty', specialty],
    ['Date',      appointmentDate
                    ? new Date(appointmentDate).toLocaleDateString('en-LK', {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                      })
                    : '—'],
    ['Time',      timeSlot ? `${timeSlot.startTime} – ${timeSlot.endTime}` : '—'],
    ['Type',      type === 'telemedicine' ? '📹 Telemedicine' : '🏥 In-person'],
  ]

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 520 }}>

        <button
          className="btn btn-outline btn-sm"
          style={{ marginBottom: 24 }}
          onClick={() => navigate('/patient/appointments')}
        >
          ← Back to My Appointments
        </button>

        <div className="page-header">
          <h1>Payment</h1>
          <p>Review your appointment details — you will be redirected to PayHere to complete payment.</p>
        </div>

        {/* Appointment summary */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>Appointment Summary</h2>

          {rows.map(([label, value]) => (
            <div
              key={label}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem',
              }}
            >
              <span style={{
                color: 'var(--text-muted)', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.75rem',
              }}>
                {label}
              </span>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, marginTop: 2 }}>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total Due</span>
            <span style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--accent)' }}>
              LKR {Number(amount).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Status card */}
        <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
          {error ? (
            <>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>❌</div>
              <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/patient/appointments')}>
                Back to My Appointments
              </button>
            </>
          ) : (
            <>
              {/* Spinner */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%', margin: '0 auto 16px',
                border: '3px solid var(--border)',
                borderTop: '3px solid var(--accent)',
                animation: 'spin 0.8s linear infinite',
              }} />
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                {initiating ? 'Preparing your payment…' : 'Redirecting to PayHere…'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Please do not close this tab.
              </div>
            </>
          )}
        </div>

        {/* Hidden PayHere form — auto-submitted once payHereData is ready */}
        {payHereData && (
          <form
            ref={formRef}
            method="post"
            action={PAYHERE_CHECKOUT_URL}
            style={{ display: 'none' }}
          >
            <input type="hidden" name="merchant_id"  value={payHereData.merchantId  ?? ''} />
            <input type="hidden" name="return_url" value={payHereData.returnUrl ?? ''} />
            <input type="hidden" name="cancel_url" value={payHereData.cancelUrl ?? ''} />
            <input type="hidden" name="notify_url" value={payHereData.notifyUrl   ?? ''} />
            <input type="hidden" name="order_id" value={payHereData.orderId     ?? ''} />
            <input type="hidden" name="items" value={payHereData.item        ?? 'Appointment Fee'} />
            <input type="hidden" name="currency" value={payHereData.currency    ?? 'LKR'} />
            <input type="hidden" name="amount" value={payHereData.amount      ?? ''} />
            <input type="hidden" name="first_name" value={payHereData.firstname   ?? 'Patient'} />
            <input type="hidden" name="last_name" value={payHereData.lastname    ?? ''} />
            <input type="hidden" name="email" value={payHereData.email       ?? ''} />
            <input type="hidden" name="phone" value={payHereData.contactNumber ?? ''} />
            <input type="hidden" name="address" value="N/A" />
            <input type="hidden" name="city" value="Colombo" />
            <input type="hidden" name="country" value="Sri Lanka" />
            <input type="hidden" name="hash" value={payHereData.hash        ?? ''} />
          </form>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>

      </div>
    </div>
  )
}