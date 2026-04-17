import React, { useEffect, useState } from 'react'
import { api } from '../../utils/api'

function extractDoctors(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.doctors)) return data.doctors
  if (Array.isArray(data?.pendingDoctors)) return data.pendingDoctors
  if (Array.isArray(data?.users)) return data.users
  return []
}

export default function VerifyDoctors() {
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionId, setActionId] = useState(null)

  const fetchPendingDoctors = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.getPendingDoctors()
      setPendingDoctors(extractDoctors(res.data))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending doctors.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingDoctors()
  }, [])

  const handleApprove = async (id) => {
    setActionId(id)
    setError('')
    setSuccess('')

    try {
      await api.approveDoctor(id)
      setPendingDoctors((prev) => prev.filter((doctor) => doctor._id !== id))
      setSuccess('Doctor approved successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve doctor.')
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (id) => {
    setActionId(id)
    setError('')
    setSuccess('')

    try {
      await api.rejectDoctor(id)
      setPendingDoctors((prev) => prev.filter((doctor) => doctor._id !== id))
      setSuccess('Doctor rejected successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject doctor.')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Verify Doctors</h1>
          <p>Approve or reject doctor registrations</p>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="success-msg" style={{ marginBottom: 16 }}>{success}</div>}

        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : pendingDoctors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p>No pending doctor registrations.</p>
          </div>
        ) : (
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Verified</th>
                  <th style={thStyle}>Approval Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDoctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td style={tdStyle}>{doctor.name || doctor.fullName || 'N/A'}</td>
                    <td style={tdStyle}>{doctor.email || 'N/A'}</td>
                    <td style={tdStyle}>{doctor.role || 'doctor'}</td>
                    <td style={tdStyle}>{doctor.isVerified ? 'Yes' : 'No'}</td>
                    <td style={tdStyle}>{doctor.approvalStatus || 'Pending'}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-accent btn-sm"
                          onClick={() => handleApprove(doctor._id)}
                          disabled={actionId === doctor._id}
                        >
                          {actionId === doctor._id ? 'Processing...' : 'Approve'}
                        </button>

                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleReject(doctor._id)}
                          disabled={actionId === doctor._id}
                        >
                          {actionId === doctor._id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '1px solid #ddd',
}

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid #eee',
}