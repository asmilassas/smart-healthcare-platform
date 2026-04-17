import React, { useEffect, useState } from 'react'
import { api } from '../../utils/api'

function extractDoctors(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.doctors)) return data.doctors
  if (Array.isArray(data?.unverifiedDoctors)) return data.unverifiedDoctors
  if (Array.isArray(data?.profiles)) return data.profiles
  return []
}

export default function VerifyDoctorProfiles() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionId, setActionId] = useState(null)

  const fetchUnverifiedDoctors = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.getUnverifiedDoctors()
      setDoctors(extractDoctors(res.data))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load unverified doctor profiles.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnverifiedDoctors()
  }, [])

  const handleVerify = async (userId) => {
    setActionId(userId)
    setError('')
    setSuccess('')

    try {
      await api.verifyDoctor(userId)
      setDoctors((prev) =>
        prev.filter((doctor) => (doctor.userId || doctor._id) !== userId)
      )
      setSuccess('Doctor profile verified successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify doctor profile.')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Verify Doctor Profiles</h1>
          <p>Approve doctor profiles submitted or updated in the doctor management service</p>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="success-msg" style={{ marginBottom: 16 }}>{success}</div>}

        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p>No doctor profiles waiting for verification.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {doctors.map((doctor) => {
              const userId = doctor.userId || doctor._id

              return (
                <div key={doctor._id || doctor.userId} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <h3 style={{ marginBottom: 12 }}>
                        {doctor.fullName || doctor.name || 'Doctor'}
                      </h3>

                      <p><strong>Email:</strong> {doctor.email || 'N/A'}</p>
                      <p><strong>Phone:</strong> {doctor.phone || 'N/A'}</p>
                      <p><strong>Hospital:</strong> {doctor.hospital || 'N/A'}</p>
                      <p><strong>Specialty:</strong> {doctor.specialty || doctor.specialization || 'N/A'}</p>
                      <p><strong>Experience:</strong> {doctor.experience ?? 'N/A'} years</p>
                      <p><strong>Consultation Fee:</strong> {doctor.consultationFee ?? 'N/A'}</p>
                      <p><strong>Available:</strong> {doctor.isAvailable ? 'Yes' : 'No'}</p>
                      <p><strong>Verified:</strong> {doctor.isVerified ? 'Yes' : 'No'}</p>
                      <p><strong>Pending Re-verification:</strong> {doctor.pendingReVerification ? 'Yes' : 'No'}</p>

                      {Array.isArray(doctor.qualifications) && doctor.qualifications.length > 0 && (
                        <p>
                          <strong>Qualifications:</strong> {doctor.qualifications.join(', ')}
                        </p>
                      )}

                      {doctor.bio && (
                        <div style={{ marginTop: 10 }}>
                          <strong>Bio:</strong>
                          <p style={{ marginTop: 4, color: 'var(--text-muted)' }}>{doctor.bio}</p>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <button
                        className="btn btn-accent"
                        onClick={() => handleVerify(userId)}
                        disabled={actionId === userId}
                      >
                        {actionId === userId ? 'Verifying...' : 'Verify Profile'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}