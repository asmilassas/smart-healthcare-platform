import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import '../../styles/Dashboard.css'

function extractList(data) {
  if (Array.isArray(data)) return data
  if (data?.appointments) return data.appointments
  return []
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ appointments: 0, pending: 0, unverified: 0, completed: 0 })
  const [recentAppts, setRecentAppts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getAllAppointments(),
      api.getUnverifiedDoctors(),
    ])
      .then(([appts, docs]) => {
        const all = extractList(appts.data)
        setRecentAppts(all.slice(0, 8))
        setStats({
          appointments: all.length,
          pending: all.filter(a => a.status === 'pending').length,
          unverified: (docs.data || []).length,
          completed: all.filter(a => a.status === 'completed').length,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Appointments', value: stats.appointments, icon: '📅' },
    { label: 'Pending Appointments', value: stats.pending, icon: '⏳' },
    { label: 'Unverified Doctors', value: stats.unverified, icon: '⚠️', alert: stats.unverified > 0 },
    { label: 'Completed', value: stats.completed, icon: '✅' },
  ]

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Platform overview and management</p>
        </div>

        <div className="quick-actions">
          <button className="quick-action-btn" onClick={() => navigate('/admin/verify-doctors')}>
            <span className="qa-icon">👨‍⚕️</span>
            <span className="qa-label">Verify Doctors</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/admin/appointments')}>
            <span className="qa-icon">📋</span>
            <span className="qa-label">All Appointments</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/admin/users')}>
            <span className="qa-icon">👥</span>
            <span className="qa-label">User Management</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/admin/appointments')}>
            <span className="qa-icon">📊</span>
            <span className="qa-label">Reports</span>
          </button>
        </div>

        <div className="grid-4" style={{ marginBottom: 32 }}>
          {statCards.map(s => (
            <div key={s.label} className="stat-card"
              style={s.alert ? { borderColor: 'var(--warning)', background: 'var(--warning-light)' } : {}}>
              <div className="stat-label">{s.icon} {s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="section-title" style={{ margin: 0 }}>Recent Appointments</h2>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/appointments')}>
              View all →
            </button>
          </div>

          {loading ? (
            <div className="loading-state">Loading…</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppts.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No appointments yet</td></tr>
                  ) : recentAppts.map(a => (
                    <tr key={a._id}>
                      <td>{a.patientName}</td>
                      <td>{a.doctorName}</td>
                      <td>{a.specialty}</td>
                      <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                      <td style={{ fontSize: '0.82rem' }}>{a.type === 'telemedicine' ? '📹 Video' : '🏥 In-person'}</td>
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
