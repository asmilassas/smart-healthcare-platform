import React, { useEffect, useState } from 'react'
import { api } from '../../utils/api'

function extractDoctors(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.doctors)) return data.doctors
  if (Array.isArray(data?.pendingDoctors)) return data.pendingDoctors
  if (Array.isArray(data?.users)) return data.users
  return []
}

export default function AdminDoctorVerification() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadPendingDoctors = async () => {
    setError('')
    try {
      const res = await api.getPendingDoctors()
      setDoctors(extractDoctors(res.data))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending doctors.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPendingDoctors()
  }, [])

  const handleApprove = async (id) => {
    setActionLoading(id)
    setError('')
    setSuccess('')

    try {
      await api.approveDoctor(id)
      setDoctors((prev) => prev.filter((doc) => doc._id !== id))
      setSuccess('Doctor approved successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve doctor.')
    } finally {
      setActionLoading('')
    }
  }

  const handleReject = async (id) => {
    setActionLoading(id)
    setError('')
    setSuccess('')

    try {
      await api.rejectDoctor(id)
      setDoctors((prev) => prev.filter((doc) => doc._id !== id))
      setSuccess('Doctor rejected successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject doctor.')
    } finally {
      setActionLoading('')
    }
  }

  if (loading) return <div className="loading-state">Loading pending doctors…</div>

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Verify Doctor Accounts</h1>
          <p>Approve or reject doctor registrations waiting for admin review</p>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}
        {success && <div className="success-msg" style={{ marginBottom: 20 }}>{success}</div>}

        {doctors.length === 0 ? (
          <div className="card">
            <p>No pending doctor accounts found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {doctors.map((doc) => (
              <div key={doc._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ marginBottom: 10 }}>{doc.name || doc.fullName || 'Doctor'}</h3>
                    <p><strong>Email:</strong> {doc.email || 'N/A'}</p>
                    <p><strong>Role:</strong> {doc.role || 'doctor'}</p>
                    <p><strong>Status:</strong> Pending Approval</p>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button
                      className="btn btn-accent"
                      onClick={() => handleApprove(doc._id)}
                      disabled={actionLoading === doc._id}
                    >
                      {actionLoading === doc._id ? 'Processing…' : 'Approve'}
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => handleReject(doc._id)}
                      disabled={actionLoading === doc._id}
                    >
                      {actionLoading === doc._id ? 'Processing…' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}