import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import '../../styles/Dashboard.css'
import '../../styles/Search.css'

const SPECIALTIES = [
  'All', 'General Medicine', 'Cardiology', 'Dermatology',
  'Neurology', 'Pediatrics', 'Orthopedics', 'Psychiatry', 'Oncology',
  'Gynecology', 'Ophthalmology', 'ENT', 'Urology', 'Endocrinology',
]

// getDoctors() returns { total, page, totalPages, doctors:[...] }
function extractDoctors(data) {
  if (Array.isArray(data)) return data
  if (data?.doctors) return data.doctors
  return []
}

export default function BrowseDoctors() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('All')
  const [error, setError] = useState('')

  useEffect(() => {
    api.getDoctors()
      .then(r => setDoctors(extractDoctors(r.data)))
      .catch(() => setError('Could not load doctors. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = doctors.filter(d => {
    const matchSearch =
      d.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty?.toLowerCase().includes(search.toLowerCase())
    const matchSpec = specialty === 'All' || d.specialty === specialty
    return matchSearch && matchSpec && d.isVerified
  })

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Find a Doctor</h1>
          <p>Browse verified doctors and book an appointment</p>
        </div>

        <div className="search-bar-row">
          <input
            className="input-field search-input"
            placeholder="Search by name or specialty…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="select-field specialty-select"
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
          >
            {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading-state">Loading doctors…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>No doctors found matching your search.</p>
            {doctors.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
                No verified doctors are available yet. Please check back later.
              </p>
            )}
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(doc => (
              <div key={doc._id} className="doctor-card">
                <div className="doctor-card-top">
                  <div className="doctor-avatar">
                    {doc.fullName?.charAt(0) || 'D'}
                  </div>
                  <div className="doctor-info">
                    <h3>{doc.fullName}</h3>
                    <span className="specialty">{doc.specialty}</span>
                  </div>
                </div>

                <div className="doctor-card-meta">
                  <span>🎓 {doc.experience || 0} yrs exp</span>
                  {doc.isAvailable
                    ? <span style={{ color: 'var(--success)' }}>● Available</span>
                    : <span style={{ color: 'var(--danger)' }}>● Unavailable</span>
                  }
                </div>

                {doc.bio && (
                  <p style={{
                    fontSize: '0.83rem', color: 'var(--text-muted)',
                    marginBottom: 14, lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {doc.bio}
                  </p>
                )}

                {doc.qualifications?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {doc.qualifications.map(q => (
                      <span key={q} style={{
                        fontSize: '0.75rem', background: 'var(--surface-2)',
                        padding: '2px 8px', borderRadius: 99,
                        border: '1px solid var(--border)'
                      }}>{q}</span>
                    ))}
                  </div>
                )}

                <div className="doctor-card-footer">
                  <div className="fee">
                    LKR {doc.consultationFee?.toLocaleString()}
                    <small> / session</small>
                  </div>
                  <button
                    className="btn btn-accent btn-sm"
                    disabled={!doc.isAvailable}
                    onClick={() => navigate(`/patient/book/${doc.userId}`)}
                  >
                    Book →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
