import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import '../../styles/Dashboard.css'

function extractList(data) {
  if (Array.isArray(data)) return data
  if (data?.appointments) return data.appointments
  return []
}

export default function DoctorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const doctorUserId = user?.id || user?._id

  useEffect(() => {
    if (!doctorUserId) {
      setLoading(false)
      return
    }

    Promise.all([
      api.getDoctorAppointments(),
      api.getDoctor(doctorUserId),
    ])
      .then(([appts, doc]) => {
        setAppointments(extractList(appts.data))
        setProfile(doc.data)
      })
      .catch((error) => {
        console.error('Failed to load doctor dashboard:', error)
      })
      .finally(() => setLoading(false))
  }, [doctorUserId])

  const today = appointments.filter((a) => {
    const d = new Date(a.appointmentDate)
    const now = new Date()
    return d.toDateString() === now.toDateString() && a.status !== 'cancelled'
  })

  const pending = appointments.filter((a) => a.status === 'pending')

  const uniquePatients = new Set(
    appointments
      .map((a) => a.patientId || a.patient?._id || a.patientName)
      .filter(Boolean)
  ).size

  const completedCount = appointments.filter((a) => a.status === 'completed').length

  const stats = [
    { label: 'Total Patients', value: uniquePatients },
    { label: "Today's Appointments", value: today.length },
    { label: 'Pending Requests', value: pending.length },
    { label: 'Completed', value: completedCount },
  ]

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Hello, Dr. {user?.name?.split(' ').pop() || 'Doctor'} 👨‍⚕️</h1>

          {profile && !profile.isVerified && (
            <div
              className="error-msg"
              style={{ marginTop: 10, display: 'inline-block' }}
            >
              ⚠️ Your profile is pending admin verification.
            </div>
          )}

          {profile?.isVerified && (
            <p>
              <span className="badge badge-verified">✓ Verified Doctor</span>
              &nbsp;{profile.specialty || profile.specialization || 'Doctor'}
            </p>
          )}
        </div>

        <div className="quick-actions">
          <button
            className="quick-action-btn"
            onClick={() => navigate('/doctor/appointments')}
          >
            <span className="qa-icon">📅</span>
            <span className="qa-label">Appointments</span>
          </button>

          <button
            className="quick-action-btn"
            onClick={() => navigate('/doctor/availability')}
          >
            <span className="qa-icon">🗓️</span>
            <span className="qa-label">Set Availability</span>
          </button>

          <button
            className="quick-action-btn"
            onClick={() => navigate('/doctor/profile')}
          >
            <span className="qa-icon">👤</span>
            <span className="qa-label">My Profile</span>
          </button>

          <button
            className="quick-action-btn"
            onClick={() => navigate('/doctor/appointments')}
          >
            <span className="qa-icon">💊</span>
            <span className="qa-label">Issue Rx</span>
          </button>
        </div>

        <div className="grid-4" style={{ marginBottom: 32 }}>
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h2 className="section-title">Today's Schedule</h2>

          {loading ? (
            <div className="loading-state">Loading…</div>
          ) : today.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <p>No appointments scheduled for today.</p>
            </div>
          ) : (
            <div className="appt-list">
              {today.map((a) => (
                <div key={a._id} className="appt-row">
                  <div className="appt-row-left">
                    <div className="appt-doctor-initial">
                      {a.patientName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div className="appt-doctor-name">
                        {a.patientName || 'Patient'}
                      </div>
                      <div className="appt-meta">
                        {a.timeSlot?.startTime || 'No time'} ·{' '}
                        {a.type === 'telemedicine' ? '📹 Video' : '🏥 In-person'}
                      </div>
                    </div>
                  </div>

                  <div className="appt-row-right">
                    <span className={`badge badge-${a.status}`}>
                      {a.status}
                    </span>

                    {a.status === 'confirmed' && a.videoRoomId && (
                      <a
                        href={`https://meet.jit.si/${a.videoRoomId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-accent btn-sm"
                        style={{ marginTop: 4 }}
                      >
                        Join
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {pending.length > 0 && (
          <div className="card">
            <h2 className="section-title">Pending Requests ({pending.length})</h2>
            <div className="appt-list">
              {pending.slice(0, 5).map((a) => (
                <div key={a._id} className="appt-row">
                  <div className="appt-row-left">
                    <div className="appt-doctor-initial">
                      {a.patientName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div className="appt-doctor-name">
                        {a.patientName || 'Patient'}
                      </div>
                      <div className="appt-meta">
                        {new Date(a.appointmentDate).toLocaleDateString()} ·{' '}
                        {a.timeSlot?.startTime || 'No time'}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate('/doctor/appointments')}
                  >
                    Respond →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}