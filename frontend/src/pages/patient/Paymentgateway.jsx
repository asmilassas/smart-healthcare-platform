import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'

const PAYHERE_CHECKOUT_URL = 'https://sandbox.payhere.lk/pay/checkout'

export default function PaymentGateway() {
  const { user } = useAuth()
  const { state } = useLocation()
  const navigate  = useNavigate()

  const [initiating, setInitiating] = useState(true)
  const [ready, setReady] = useState(false)
  const [error,      setError]      = useState('')
  const [payHereData, setPayHereData] = useState(null)

  const formRef = useRef(null)

  useEffect(() => {
    if (!state?.appointmentId) {
      navigate('/patient/appointments', { replace: true })
    }
  }, [state, navigate])

  useEffect(() => {
    if (!state?.appointmentId) return

    api.initiatePayment({
      appointmentId: state.appointmentId,
      amount:        state.consultationFee,
      patientId:     state.patientId,
      firstName:     state.patientName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Patient',
      lastName:      state.patientName?.split(' ').slice(1).join(' ') || user?.name?.split(' ').slice(1).join(' ') || '',
      email:         user?.email || 'patient@example.com',
    })
      .then(res => {
        setPayHereData(res.data)
        setInitiating(false)
        setReady(true)
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Could not initiate payment. Please try again.'
        setError(msg)
        setInitiating(false)
      })
  }, [])

  
  if (!state?.appointmentId) return null

  const { appointmentId, consultationFee, doctorName, specialty, appointmentDate, timeSlot, type } = state

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
              LKR {Number(consultationFee).toLocaleString()}
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
          ) : ready ? (
  <>
    <div style={{ fontSize: '2rem', marginBottom: 12 }}>✅</div>
    <div style={{ fontWeight: 600, marginBottom: 16 }}>Payment ready!</div>
    <button
      className="btn btn-primary"
      // onClick={() => formRef.current?.submit()}
      onClick={() => {
        console.log('PayHere data:', payHereData)  // ← add this
        formRef.current?.submit()
      }}
    >
      Proceed to PayHere →
    </button>
  </>
) : (
  <>
    {/* existing spinner */}
    <div style={{
      width: 44, height: 44, borderRadius: '50%', margin: '0 auto 16px',
      border: '3px solid var(--border)',
      borderTop: '3px solid var(--accent)',
      animation: 'spin 0.8s linear infinite',
    }} />
    <div style={{ fontWeight: 600, marginBottom: 6 }}>Preparing your payment…</div>
    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
      Please do not close this tab.
    </div>
  </>
          )}
        </div>
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
            <input type="hidden" name="notify_url"   value={payHereData.notifyUrl   ?? ''} />
            <input type="hidden" name="order_id"     value={payHereData.orderId     ?? ''} />
            <input type="hidden" name="items"        value={payHereData.item        ?? 'Appointment Fee'} />
            <input type="hidden" name="currency"     value={payHereData.currency    ?? 'LKR'} />
            <input type="hidden" name="amount"       value={payHereData.amount      ?? ''} />
            <input type="hidden" name="first_name"   value={payHereData.firstname   ?? 'Patient'} />
            <input type="hidden" name="last_name"    value={payHereData.lastname    ?? ''} />
            <input type="hidden" name="email"        value={payHereData.email       ?? ''} />
            <input type="hidden" name="phone"        value={payHereData.contactNumber ?? ''} />
            <input type="hidden" name="address"      value="N/A" />
            <input type="hidden" name="city"         value="Colombo" />
            <input type="hidden" name="country"      value="Sri Lanka" />
            <input type="hidden" name="hash"         value={payHereData.hash        ?? ''} />
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