import React, { useState, useEffect } from 'react'
import { api } from '../../utils/api'

function extractDoctors(data) {
  if (Array.isArray(data)) return data
  if (data?.doctors) return data.doctors
  return []
}

export default function VerifyDoctors() {
  const [pendingDocs, setPendingDocs] = useState([])  
  const [verifiedDocs, setVerifiedDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [actionId, setActionId]  = useState(null)
  const [error, setError] = useState('')
  const [expanded, setExpanded]  = useState({})      

  const fetchDoctors = () => {
    setLoading(true)
    Promise.all([
      api.getUnverifiedDoctors(),   
      api.getAllDoctorsAdmin(),      
    ])
      .then(([unv, all]) => {
        setPendingDocs(Array.isArray(unv.data) ? unv.data : [])
        const allList = extractDoctors(all.data)
        setVerifiedDocs(allList.filter(d => d.isVerified && !d.pendingReVerification))
      })
      .catch(() => setError('Failed to load doctors.'))
      .finally(() => setLoading(false))
  }

  useEffect(fetchDoctors, [])

  const handleVerify = async (userId) => {
    setActionId(userId)
    try {
      await api.verifyDoctor(userId)
      const justVerified = pendingDocs.find(d => d.userId === userId)
      if (justVerified) {
        setPendingDocs(prev => prev.filter(d => d.userId !== userId))
        setVerifiedDocs(prev => [...prev, { ...justVerified, isVerified: true, pendingReVerification: false }])
      }
    } catch {
      alert('Could not verify doctor. Please try again.')
    } finally {
      setActionId(null)
    }
  }

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const DoctorCard = ({ doc, showVerify }) => {
    const isExpanded = expanded[doc._id]
    const isReVerify = doc.isVerified === false && doc.pendingReVerification
    const isNew = doc.isVerified === false && !doc.pendingReVerification

    return (
      <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
        {/* Card Header */}
        <div style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
              background: 'var(--accent-light)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1.2rem',
            }}>
              {doc.fullName?.charAt(0) || 'D'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{doc.fullName}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>{doc.email}</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', background: 'var(--accent-light)', color: 'var(--accent)', padding: '2px 9px', borderRadius: 99, fontWeight: 600 }}>
                  {doc.specialty}
                </span>
                {isNew      && <span className="badge badge-unverified">New Registration</span>}
                {isReVerify && <span className="badge" style={{ background: '#fde8ff', color: '#a21caf' }}>⟳ Profile Updated</span>}
                {doc.isVerified && !doc.pendingReVerification && <span className="badge badge-verified">✓ Verified</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            {showVerify && (
              <button
                className="btn btn-accent btn-sm"
                onClick={() => handleVerify(doc.userId)}
                disabled={actionId === doc.userId}
                style={{ minWidth: 130 }}
              >
                {actionId === doc.userId
                  ? 'Verifying…'
                  : isReVerify ? '✓ Re-Verify' : '✓ Verify Doctor'}
              </button>
            )}
            <button
              className="btn btn-outline btn-sm"
              onClick={() => toggleExpand(doc._id)}
              style={{ minWidth: 130 }}
            >
              {isExpanded ? '▲ Hide Details' : '▼ View Full Details'}
            </button>
          </div>
        </div>

        {/* Quick summary row — always visible */}
        <div style={{ padding: '10px 22px 14px', display: 'flex', gap: 28, flexWrap: 'wrap', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <Detail label="Hospital" value={doc.hospital || '—'} />
          <Detail label="Experience" value={doc.experience !== undefined ? `${doc.experience} yrs` : '—'} />
          <Detail label="Fee" value={doc.consultationFee ? `LKR ${doc.consultationFee.toLocaleString()}` : '—'} />
          <Detail label="Phone" value={doc.phone || '—'} />
          <Detail label="Available" value={doc.isAvailable ? 'Yes' : 'No'} />
        </div>

        {/* Expanded full details */}
        {isExpanded && (
          <div style={{ padding: '20px 22px', borderTop: '1px solid var(--border)' }}>
            <div className="grid-2" style={{ gap: 20, marginBottom: 16 }}>
              <Section label="Full Name" value={doc.fullName} />
              <Section label="Email" value={doc.email} />
              <Section label="Phone" value={doc.phone || '—'} />
              <Section label="Hospital / Clinic" value={doc.hospital || '—'} />
              <Section label="Specialty" value={doc.specialty} />
              <Section label="Years of Experience" value={`${doc.experience} years`} />
              <Section label="Consultation Fee" value={`LKR ${doc.consultationFee?.toLocaleString() || '—'}`} />
              <Section label="Currently Accepting Patients" value={doc.isAvailable ? 'Yes' : 'No'} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div className="detail-label">Qualifications</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {(doc.qualifications || []).length > 0
                  ? doc.qualifications.map(q => (
                      <span key={q} style={{ fontSize: '0.83rem', background: 'var(--surface-2)', padding: '3px 10px', borderRadius: 99, border: '1px solid var(--border)', fontWeight: 500 }}>
                        {q}
                      </span>
                    ))
                  : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No qualifications listed</span>
                }
              </div>
            </div>

            {doc.bio && (
              <div style={{ marginBottom: 14 }}>
                <div className="detail-label">Professional Bio</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text)', marginTop: 6, lineHeight: 1.6 }}>
                  {doc.bio}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div className="detail-label">Profile Created</div>
                <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
                  {new Date(doc.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div>
                <div className="detail-label">Last Updated</div>
                <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
                  {new Date(doc.updatedAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Re-verify notice */}
            {isReVerify && (
              <div style={{
                marginTop: 16, padding: '12px 16px',
                background: '#fde8ff', borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem', color: '#a21caf',
                border: '1px solid #f0abfc'
              }}>
                ⟳ This doctor updated their profile and is awaiting your re-verification. Review the details above before approving.
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Doctor Verification</h1>
          <p>Review and approve new doctor registrations and profile updates</p>
        </div>

        {/* Summary */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          <div className="stat-card" style={pendingDocs.length > 0 ? { borderColor: 'var(--warning)', background: 'var(--warning-light)' } : {}}>
            <div className="stat-label">⏳ Awaiting Review</div>
            <div className="stat-value">{pendingDocs.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">✓ Verified Doctors</div>
            <div className="stat-value">{verifiedDocs.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">New Registrations</div>
            <div className="stat-value">{pendingDocs.filter(d => !d.pendingReVerification).length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Profile Updates</div>
            <div className="stat-value">{pendingDocs.filter(d => d.pendingReVerification).length}</div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
            Pending Review ({pendingDocs.length})
          </button>
          <button className={`tab-btn ${tab === 'verified' ? 'active' : ''}`} onClick={() => setTab('verified')}>
            Verified ({verifiedDocs.length})
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading-state">Loading…</div>
        ) : tab === 'pending' ? (
          pendingDocs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <p>No doctors pending review.</p>
            </div>
          ) : (
            pendingDocs.map(d => <DoctorCard key={d._id} doc={d} showVerify />)
          )
        ) : (
          verifiedDocs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👨‍⚕️</div>
              <p>No verified doctors yet.</p>
            </div>
          ) : (
            verifiedDocs.map(d => <DoctorCard key={d._id} doc={d} showVerify={false} />)
          )
        )}
      </div>

      <style>{`
        .detail-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
      `}</style>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.88rem', fontWeight: 500, marginTop: 2 }}>{value}</div>
    </div>
  )
}

function Section({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.9rem' }}>{value}</div>
    </div>
  )
}