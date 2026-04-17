import React, { useEffect, useState } from 'react'
import { api } from '../../utils/api'
import { useNavigate } from 'react-router-dom'

function extractAppointments(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.appointments)) return data.appointments
  return []
}

export default function MyAppointments() {
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionId, setActionId] = useState(null)

  const loadAppointments = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getMyAppointments()
      setAppointments(extractAppointments(res.data))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  const handleCancel = async (id) => {
    setActionId(id)
    setError('')
    setSuccess('')

    try {
      await api.cancelAppointment(id)
      setSuccess('Appointment cancelled successfully.')
      await loadAppointments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment.')
    } finally {
      setActionId(null)
    }
  }

  if (loading) return <div className="loading-state">Loading appointments…</div>

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* HEADER WITH ADD BUTTON */}
        <div
          className="page-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
          <div>
            <h1>My Appointments</h1>
            <p>Track appointment requests, payments, and consultation details</p>
          </div>

          <button
            className="btn btn-accent"
            onClick={() => navigate('/patient/doctors')}
          >
            + Add New Appointment
          </button>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="success-msg" style={{ marginBottom: 16 }}>{success}</div>}

        {appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No appointments found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {appointments.map((a) => {
              const canCancel =
                a.status === 'pending' ||
                (a.status === 'confirmed' && a.paymentStatus === 'unpaid')

              const canPay =
                a.status === 'confirmed' && a.paymentStatus === 'unpaid'

              const canJoin =
                a.status === 'confirmed' &&
                a.paymentStatus === 'paid' &&
                a.type === 'telemedicine' &&
                (a.meetingLink || a.videoRoomId)

              const showOnsite =
                a.status === 'confirmed' &&
                a.paymentStatus === 'paid' &&
                a.type === 'in-person'

              return (
                <div key={a._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    
                    {/* LEFT SIDE */}
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <h3 style={{ marginBottom: 10 }}>{a.doctorName}</h3>

                      <p><strong>Specialty:</strong> {a.specialty}</p>
                      <p><strong>Date:</strong> {new Date(a.appointmentDate).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {a.timeSlot?.startTime} - {a.timeSlot?.endTime}</p>
                      <p><strong>Type:</strong> {a.type === 'telemedicine' ? '📹 Telemedicine' : '🏥 In-person'}</p>
                      <p><strong>Status:</strong> <span className={`badge badge-${a.status}`}>{a.status}</span></p>
                      <p><strong>Payment:</strong> <span className={`badge badge-${a.paymentStatus}`}>{a.paymentStatus}</span></p>

                      {a.reasonForVisit && (
                        <p><strong>Reason:</strong> {a.reasonForVisit}</p>
                      )}

                      {/* STATUS MESSAGES */}
                      {a.status === 'pending' && a.paymentStatus === 'unpaid' && (
                        <div className="warning-banner" style={{ marginTop: 12 }}>
                          Waiting for doctor confirmation.
                        </div>
                      )}

                      {a.status === 'confirmed' && a.paymentStatus === 'unpaid' && (
                        <div className="warning-banner" style={{ marginTop: 12 }}>
                          Your appointment was confirmed. Please complete payment.
                        </div>
                      )}

                      {canJoin && (
                        <div className="success-banner" style={{ marginTop: 12 }}>
                          Your telemedicine appointment is ready.
                        </div>
                      )}

                      {showOnsite && (
                        <div className="success-banner" style={{ marginTop: 12 }}>
                          <strong>Onsite Details:</strong> {a.onsiteDetails || 'Please visit the clinic at the booked time.'}
                        </div>
                      )}

                      {a.status === 'completed' && (
                        <div className="success-banner" style={{ marginTop: 12 }}>
                          Appointment completed successfully.
                        </div>
                      )}

                      {a.status === 'cancelled' && (
                        <div className="error-msg" style={{ marginTop: 12 }}>
                          This appointment was cancelled.
                        </div>
                      )}
                    </div>

                    {/* RIGHT SIDE BUTTONS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
                      
                      {canPay && (
                        <button
                          className="btn btn-accent"
                          onClick={() => navigate(`/patient/payment/${a._id}`)}
                        >
                          Pay Now
                        </button>
                      )}

                      {canJoin && (
                        <a
                          href={a.meetingLink || `https://meet.jit.si/${a.videoRoomId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-accent"
                          style={{ textAlign: 'center' }}
                        >
                          Join Consultation
                        </a>
                      )}

                      {canCancel && (
                        <button
                          className="btn btn-outline"
                          onClick={() => handleCancel(a._id)}
                          disabled={actionId === a._id}
                        >
                          {actionId === a._id ? 'Processing...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .warning-banner {
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          background: var(--warning-light);
          color: var(--warning);
          font-size: 0.88rem;
        }
        .success-banner {
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          background: var(--success-light);
          color: var(--success);
          font-size: 0.88rem;
        }
      `}</style>
    </div>
  )
}