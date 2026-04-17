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

export default function PatientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMyAppointments()
      .then(r => setAppointments(extractList(r.data)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const upcoming = appointments.filter(a =>
    ['pending', 'confirmed'].includes(a.status) &&
    new Date(a.appointmentDate) >= new Date()
  )
  const recent = appointments.slice(0, 5)

  const stats = [
    { label: 'Total Appointments', value: appointments.length },
    { label: 'Upcoming', value: upcoming.length },
    { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length },
    { label: 'Prescriptions', value: appointments.filter(a => a.prescriptionId).length },
  ]

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Manage your health appointments and records</p>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={() => navigate('/patient/doctors')}>
            <span className="qa-icon">🔍</span>
            <span className="qa-label">Find a Doctor</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/patient/appointments')}>
            <span className="qa-icon">📅</span>
            <span className="qa-label">My Appointments</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/patient/prescriptions')}>
            <span className="qa-icon">💊</span>
            <span className="qa-label">Prescriptions</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/patient/profile')}>
            <span className="qa-icon">👤</span>
            <span className="qa-label">My Profile</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/patient/symptom-checker')}>
            <span className="qa-icon">🩺</span>
            <span className="qa-label">Symptom Checker</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 className="section-title">Upcoming Appointments</h2>
            <div className="appt-list">
              {upcoming.slice(0, 3).map(a => (
                <div key={a._id} className="appt-row">
                  <div className="appt-row-left">
                    <div className="appt-doctor-initial">
                      {a.doctorName?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <div className="appt-doctor-name">{a.doctorName}</div>
                      <div className="appt-meta">{a.specialty} · {a.timeSlot?.startTime}</div>
                    </div>
                  </div>
                  <div className="appt-row-right">
                    <div className="appt-date">
                      {new Date(a.appointmentDate).toLocaleDateString('en-LK', {
                        weekday: 'short', month: 'short', day: 'numeric'
                      })}
                    </div>
                    <span className={`badge badge-${a.status}`}>{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: 16 }}
              onClick={() => navigate('/patient/appointments')}
            >
              View all appointments →
            </button>
          </div>
        )}

        {/* Recent */}
        <div className="card">
          <h2 className="section-title">Recent Activity</h2>
          {loading ? (
            <div className="loading-state">Loading…</div>
          ) : recent.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No appointments yet.</p>
              <button
                className="btn btn-accent btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => navigate('/patient/doctors')}
              >
                Book your first appointment
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(a => (
                    <tr key={a._id}>
                      <td>{a.doctorName}</td>
                      <td>{a.specialty}</td>
                      <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                      <td>
                        <span style={{ fontSize: '0.82rem' }}>
                          {a.type === 'telemedicine' ? '📹 Video' : '🏥 In-person'}
                        </span>
                      </td>
                      <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                      <td><span className={`badge badge-${a.paymentStatus}`}>{a.paymentStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
