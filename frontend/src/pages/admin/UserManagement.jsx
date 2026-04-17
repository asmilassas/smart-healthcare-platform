import React, { useState, useEffect } from 'react'
import { api } from '../../utils/api'

function extractDoctors(data) {
  if (Array.isArray(data)) return data
  if (data?.doctors) return data.doctors
  return []
}

export default function UserManagement() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]  = useState('')
  const [error, setError]   = useState('')

  useEffect(() => {
    api.getAllDoctorsAdmin()
      .then(r => setDoctors(extractDoctors(r.data)))
      .catch(() =>
        api.getDoctors()
          .then(r => setDoctors(extractDoctors(r.data)))
          .catch(() => setError('Failed to load users.'))
      )
      .finally(() => setLoading(false))
  }, [])

  const filtered = doctors.filter(d =>
    d.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty?.toLowerCase().includes(search.toLowerCase()) ||
    d.hospital?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>User Management</h1>
          <p>View and manage registered doctors</p>
        </div>

        <div className="grid-4" style={{ marginBottom: 28 }}>
          <div className="stat-card">
            <div className="stat-label">Total Doctors</div>
            <div className="stat-value">{doctors.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Verified</div>
            <div className="stat-value">{doctors.filter(d => d.isVerified && !d.pendingReVerification).length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Review</div>
            <div className="stat-value">{doctors.filter(d => !d.isVerified || d.pendingReVerification).length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Available Now</div>
            <div className="stat-value">{doctors.filter(d => d.isAvailable && d.isVerified && !d.pendingReVerification).length}</div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <input
            className="input-field"
            placeholder="Search by name, email, hospital or specialty…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 460 }}
          />
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading-state">Loading users…</div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Hospital</th>
                    <th>Specialty</th>
                    <th>Qualifications</th>
                    <th>Exp.</th>
                    <th>Fee (LKR)</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                        No doctors found.
                      </td>
                    </tr>
                  ) : filtered.map(d => (
                    <tr key={d._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'var(--accent-light)', color: 'var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                          }}>
                            {d.fullName?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{d.fullName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.email}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{d.hospital || '—'}</td>
                      <td>
                        <span style={{ fontSize: '0.78rem', background: 'var(--accent-light)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                          {d.specialty}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 160 }}>
                        {(d.qualifications || []).join(', ') || '—'}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{d.experience} yrs</td>
                      <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{d.consultationFee?.toLocaleString()}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {d.rating > 0 ? `⭐ ${d.rating.toFixed(1)}` : '—'}
                      </td>
                      <td>
                        {d.pendingReVerification
                          ? <span className="badge" style={{ background: '#fde8ff', color: '#a21caf', fontSize: '0.72rem' }}>⟳ Update Pending</span>
                          : <span className={`badge ${d.isVerified ? 'badge-verified' : 'badge-unverified'}`}>
                              {d.isVerified ? '✓ Verified' : '⏳ Pending'}
                            </span>
                        }
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: d.isAvailable ? 'var(--success)' : 'var(--danger)' }}>
                          {d.isAvailable ? '● Yes' : '● No'}
                        </span>
                      </td>
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