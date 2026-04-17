import React, { useState, useEffect } from 'react'
import { api } from '../../utils/api'

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no-show']

function extractList(data) {
  if (Array.isArray(data)) return data
  if (data?.appointments) return data.appointments
  return []
}

export default function AllAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.getAllAppointments()
      .then(r => setAppointments(extractList(r.data)))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = appointments.filter(a => {
    const matchStatus = filter === 'all' || a.status === filter
    const matchSearch =
      a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      a.specialty?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const countOf = s => appointments.filter(a => a.status === s).length

  const totalRevenue = appointments
    .filter(a => a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.consultationFee || 0), 0)

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>All Appointments</h1>
          <p>Platform-wide appointment management and oversight</p>
        </div>

        <div className="grid-4" style={{ marginBottom: 28 }}>
          <div className="stat-card">
            <div className="stat-label">Total</div>
            <div className="stat-value">{appointments.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Confirmed</div>
            <div className="stat-value">{countOf('confirmed')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{countOf('completed')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Revenue (Paid)</div>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>
              LKR {totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <input
            className="input-field"
            placeholder="Search by patient, doctor, or specialty…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>

        <div className="tabs">
          {STATUS_FILTERS.map(f => (
            <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && <span style={{ marginLeft: 5, fontSize: '0.75rem' }}>({countOf(f)})</span>}
            </button>
          ))}
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading-state">Loading appointments…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No appointments found.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Fee (LKR)</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 500 }}>{a.patientName}</td>
                      <td>{a.doctorName}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', background: 'var(--accent-light)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                          {a.specialty}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.88rem' }}>
                          {new Date(a.appointmentDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {a.timeSlot?.startTime} – {a.timeSlot?.endTime}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{a.type === 'telemedicine' ? '📹 Video' : '🏥 In-person'}</td>
                      <td style={{ fontWeight: 600 }}>{a.consultationFee?.toLocaleString()}</td>
                      <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                      <td><span className={`badge badge-${a.paymentStatus}`}>{a.paymentStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}