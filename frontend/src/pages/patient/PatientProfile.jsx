import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function PatientProfile() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Manage your personal information</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--accent-light)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1.8rem'
            }}>
              {user?.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{user?.email}</div>
              <span className="badge badge-confirmed" style={{ marginTop: 6 }}>Patient</span>
            </div>
          </div>

          <div className="divider" />

          <div style={{ marginTop: 24 }}>
            <h3 className="section-title" style={{ fontSize: '1rem' }}>Account Information</h3>
            <div className="grid-2" style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="input-field" defaultValue={user?.name} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="input-field" defaultValue={user?.email} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="input-field" defaultValue="Patient" readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Account ID</label>
                <input className="input-field" defaultValue={user?.id} readOnly style={{ fontFamily: 'monospace', fontSize: '0.8rem' }} />
              </div>
            </div>
          </div>

          <div className="divider" />

          <div style={{ marginTop: 24 }}>
            <h3 className="section-title" style={{ fontSize: '1rem' }}>Quick Links</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
              <a href="/patient/appointments" className="btn btn-outline btn-sm">📅 My Appointments</a>
              <a href="/patient/prescriptions" className="btn btn-outline btn-sm">💊 My Prescriptions</a>
              <a href="/patient/doctors" className="btn btn-outline btn-sm">🔍 Find Doctors</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
