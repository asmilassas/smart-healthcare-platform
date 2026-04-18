import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'

function extractList(data) {
  if (Array.isArray(data)) return data
  if (data?.appointments) return data.appointments
  return []
}

export default function DoctorAppointments() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actionId, setActionId] = useState(null)
  const [error, setError] = useState('')
  const [expandedImage, setExpandedImage] = useState(null)

  const fetchAppts = () => {
    setLoading(true)
    api.getDoctorAppointments()
      .then(r => setAppointments(extractList(r.data)))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false))
  }

  useEffect(fetchAppts, [])

  const respond = async (id, action) => {
    setActionId(id)
    try {
      await api.respondToAppointment(id, { action })
      setAppointments(prev => prev.map(a =>
        a._id === id ? { ...a, status: action === 'confirm' ? 'confirmed' : 'cancelled' } : a
      ))
    } catch {
      alert('Action failed. Please try again.')
    } finally {
      setActionId(null)
    }
  }

  const complete = async (id) => {
    setActionId(id)
    try {
      await api.completeAppointment(id)
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'completed' } : a))
    } catch {
      alert('Could not mark as completed.')
    } finally {
      setActionId(null)
    }
  }

  const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled']
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Appointments</h1>
          <p>Review, accept, and manage patient appointments</p>
        </div>

        <div className="tabs">
          {filters.map(f => (
            <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span style={{ marginLeft: 6, fontSize: '0.75rem' }}>
                  ({appointments.filter(a => a.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading-state">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No {filter === 'all' ? '' : filter} appointments.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(a => (
              <div key={a._id} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%',
                      background: 'var(--surface-2)', color: 'var(--text)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '1rem', border: '1.5px solid var(--border)'
                    }}>
                      {a.patientName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.patientName}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {new Date(a.appointmentDate).toLocaleDateString('en-LK', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                        &nbsp;·&nbsp;{a.timeSlot?.startTime} – {a.timeSlot?.endTime}
                      </div>
                      {a.patientPhone && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          📞 {a.patientPhone}
                        </div>
                      )}
                      {a.reasonForVisit && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          Reason: {a.reasonForVisit}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span className={`badge badge-${a.status}`}>{a.status}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {a.type === 'telemedicine' ? '📹' : '🏥'} {a.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>LKR {a.consultationFee?.toLocaleString()}</div>
                  </div>
                </div>

                {a.reportImages?.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                      Patient Reports
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {a.reportImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`report-${idx}`}
                          onClick={() => setExpandedImage(img)}
                          style={{
                            width: 72, height: 72, objectFit: 'cover',
                            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {a.status === 'pending' && (
                    <>
                      <button className="btn btn-accent btn-sm" onClick={() => respond(a._id, 'confirm')} disabled={actionId === a._id}>
                        ✓ Accept
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => respond(a._id, 'cancel')} disabled={actionId === a._id}>
                        ✗ Reject
                      </button>
                    </>
                  )}
                  {a.status === 'confirmed' && (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => complete(a._id)}
                        disabled={actionId === a._id || a.paymentStatus !== 'paid'}
                        title={a.paymentStatus !== 'paid' ? 'Payment must be completed first' : ''}
                      >
                        ✓ Mark Complete
                      </button>
                      {!a.prescriptionId && (
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/doctor/prescribe/${a._id}`)}>
                          💊 Issue Prescription
                        </button>
                      )}
                      {a.type === 'telemedicine' && (
                        <button className="btn btn-outline btn-sm" onClick={async () => {
                          const roomId = `mediconnect-${a._id}`
                          await api.attachVideoRoom(a._id, { videoRoomId: roomId })
                          window.open(`https://meet.jit.si/${roomId}`, '_blank')
                        }}>
                          📹 Start Video Call
                        </button>
                      )}
                    </>
                  )}
                  {a.status === 'completed' && !a.prescriptionId && (
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/doctor/prescribe/${a._id}`)}>
                      💊 Issue Prescription
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {expandedImage && (
          <div
            onClick={() => setExpandedImage(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, cursor: 'pointer',
            }}
          >
            <img
              src={expandedImage}
              alt="report"
              style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8, objectFit: 'contain' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}