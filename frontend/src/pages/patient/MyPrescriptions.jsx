import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'

export default function MyPrescriptions() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Pass user.id — backend uses patientId stored in the prescription
    api.getPrescriptionsByPatient(user.id)
      .then(r => {
        const data = r.data
        setPrescriptions(Array.isArray(data) ? data : [])
      })
      .catch(() => setError('Could not load prescriptions.'))
      .finally(() => setLoading(false))
  }, [user.id])

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>My Prescriptions</h1>
          <p>All digital prescriptions issued by your doctors</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading-state">Loading prescriptions…</div>
        ) : prescriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <p>No prescriptions yet.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 6 }}>
              Prescriptions will appear here after your doctor issues one following a consultation.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {prescriptions.map(p => (
              <div key={p._id} className="card">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 4 }}>
                      Prescription — {new Date(p.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Issued for appointment on {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="badge badge-confirmed">Digital Rx</span>
                </div>

                <div className="divider" style={{ margin: '0 0 16px' }} />

                {/* Diagnosis */}
                {p.diagnosis && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                      Diagnosis
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>{p.diagnosis}</div>
                  </div>
                )}

                {/* Medications */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                    Medications
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(p.medications || []).map((med, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        padding: '10px 14px', background: 'var(--surface-2)',
                        borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                        flexWrap: 'wrap', gap: 8
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>💊 {med.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>
                            {med.dosage} · {med.frequency}
                          </div>
                          {med.instructions && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {med.instructions}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                          Duration: {med.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {p.notes && (
                  <div style={{
                    marginTop: 14, padding: '10px 14px',
                    background: 'var(--warning-light)', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem', color: 'var(--warning)'
                  }}>
                    <strong>Doctor's notes:</strong> {p.notes}
                  </div>
                )}

                {/* Follow-up */}
                {p.followUpDate && (
                  <div style={{
                    marginTop: 10, padding: '10px 14px',
                    background: 'var(--info-light)', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem', color: 'var(--info)'
                  }}>
                    📅 <strong>Follow-up:</strong> {new Date(p.followUpDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })}
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
