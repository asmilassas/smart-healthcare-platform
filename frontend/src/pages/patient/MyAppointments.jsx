import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

function extractList(data) {
  if (Array.isArray(data)) return data
  if (data?.appointments) return data.appointments
  return []
}

export default function MyAppointments() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)

  const fetch = () => {
    setLoading(true)
    api.getMyAppointments()
      .then(r => setAppointments(extractList(r.data)))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false))
  }

  useEffect(fetch, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    setCancellingId(id)
    try {
      await api.cancelAppointment(id)
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a))
    } catch {
      alert('Could not cancel appointment.')
    } finally {
      setCancellingId(null)
    }
  }

  const handlePay = (a) => {
    navigate('/patient/payment', {
      state: {
        appointmentId:   a._id,
        consultationFee:          a.consultationFee,
        doctorName:      a.doctorName,
        specialty:       a.specialty,
        appointmentDate: a.appointmentDate,
        timeSlot:        a.timeSlot,
        type:            a.type,
        patientId:       user?.id,
        patientName:     user?.name,
      },
    })
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>My Appointments</h1>
            <p>View and manage all your appointments</p>
          </div>
          <button className="btn btn-accent" onClick={() => navigate('/patient/doctors')}>
            + Book New
          </button>
        </div>

        <div className="tabs">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              className={`tab-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading-state">Loading appointments…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No {filter === 'all' ? '' : filter} appointments found.</p>
            {filter === 'all' && (
              <button className="btn btn-accent btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/patient/doctors')}>
                Book an appointment
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(a => (
              <div key={a._id} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'var(--accent-light)', color: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '1.1rem', flexShrink: 0
                    }}>
                      {a.doctorName?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{a.doctorName}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>{a.specialty}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge badge-${a.status}`}>{a.status}</span>
                    <span className={`badge badge-${a.paymentStatus}`}>{a.paymentStatus}</span>
                  </div>
                </div>

                <div className="divider" style={{ margin: '16px 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Time</div>
                    <div style={{ fontSize: '0.9rem', marginTop: 4, fontWeight: 500 }}>
                      {new Date(a.appointmentDate).toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{a.timeSlot?.startTime} – {a.timeSlot?.endTime}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</div>
                    <div style={{ fontSize: '0.9rem', marginTop: 4 }}>{a.type === 'telemedicine' ? '📹 Telemedicine' : '🏥 In-person'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fee</div>
                    <div style={{ fontSize: '0.9rem', marginTop: 4, fontWeight: 600 }}>LKR {a.consultationFee?.toLocaleString()}</div>
                  </div>
                  {a.reasonForVisit && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</div>
                      <div style={{ fontSize: '0.88rem', marginTop: 4, color: 'var(--text-muted)' }}>{a.reasonForVisit}</div>
                    </div>
                  )}
                </div>

                {a.status === 'confirmed' && a.type === 'telemedicine' && a.videoRoomId && (
                  <div style={{ marginTop: 16 }}>
                    <a href={`https://meet.jit.si/${a.videoRoomId}`} target="_blank" rel="noreferrer" className="btn btn-accent btn-sm">
                      📹 Join Video Call
                    </a>
                  </div>
                )}

                {a.prescriptionId && (
                  <div style={{ marginTop: 12 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/patient/prescriptions')}>
                      💊 View Prescription
                    </button>
                  </div>
                )}

                {a.doctorNotes && (
                  <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--info-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--info)' }}>
                    <strong>Doctor's note:</strong> {a.doctorNotes}
                  </div>
                )}

                {((['pending', 'confirmed'].includes(a.status)) || (a.status === 'confirmed' && a.paymentStatus === 'unpaid')) && (
                  <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>

                    {/* Pay button — only when confirmed AND payment is unpaid */}
                    {a.status === 'confirmed' && a.paymentStatus === 'unpaid' && (
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => handlePay(a)}
                      >
                        💳 Pay Now
                      </button>
                    )}

                    {/* Cancel button — only when pending or confirmed */}
                    {['pending', 'confirmed'].includes(a.status) && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(a._id)}
                        disabled={cancellingId === a._id}
                      >
                        {cancellingId === a._id ? 'Cancelling…' : 'Cancel Appointment'}
                      </button>
                    )}

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
