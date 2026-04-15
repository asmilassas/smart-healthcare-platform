import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'

const SPECIALTIES = [
  'General Medicine','Cardiology','Dermatology','Neurology',
  'Pediatrics','Orthopedics','Psychiatry','Oncology','Gynecology',
  'Ophthalmology','ENT','Urology','Endocrinology','Rheumatology',
]

export default function DoctorProfile() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    fullName: user.name  || '',
    email: user.email || '',
    phone: '',
    hospital: '',
    specialty: '',
    qualifications: '',
    experience: '',
    consultationFee: '',
    bio: '',
    isAvailable: true,
  })

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    api.getDoctor(user.id)
      .then(r => {
        const d = r.data
        setProfile(d)
        setForm({
          fullName: d.fullName || user.name  || '',
          email: d.email || user.email || '',
          phone: d.phone || '',
          hospital: d.hospital || '',
          specialty: d.specialty || '',
          qualifications: (d.qualifications || []).join(', '),
          experience: d.experience !== undefined ? String(d.experience) : '',
          consultationFee: d.consultationFee !== undefined ? String(d.consultationFee) : '',
          bio: d.bio || '',
          isAvailable: d.isAvailable ?? true,
        })
      })
      .catch(() => setIsNew(true))
      .finally(() => setLoading(false))
  }, [user.id])

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [e.target.name]: val }))
  }

  const buildPayload = () => {
    const quals = form.qualifications.split(',').map(q => q.trim()).filter(Boolean)
    return {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      hospital: form.hospital.trim(),
      specialty: form.specialty,
      qualifications: quals,
      experience: Number(form.experience),
      consultationFee: Number(form.consultationFee),
      bio: form.bio.trim(),
      isAvailable: form.isAvailable,
    }
  }

  // Client-side required-field guard (mirrors backend validation)
  const validate = () => {
    const quals = form.qualifications.split(',').map(q => q.trim()).filter(Boolean)
    if (!form.fullName.trim()) return 'Full name is required.'
    if (!form.phone.trim()) return 'Phone number is required.'
    if (!form.hospital.trim()) return 'Hospital / clinic name is required.'
    if (!form.specialty) return 'Specialty is required.'
    if (form.experience === '') return 'Years of experience is required.'
    if (!form.consultationFee) return 'Consultation fee is required.'
    if (quals.length === 0) return 'At least one qualification is required.'
    return null
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validate()
    if (validationError) return setError(validationError)

    setSaving(true)
    try {
      if (isNew) {
        await api.createDoctorProfile({ ...buildPayload(), userId: user.id })
        setIsNew(false)
        setSuccess('Profile created! An admin will review and verify your profile shortly.')
        setProfile({ isVerified: false, pendingReVerification: false })
      } else {
        const res = await api.updateDoctorProfile(user.id, buildPayload())
        setProfile(res.data.doctor || res.data)
        setSuccess('Profile updated. Your changes are pending admin re-verification before you appear in search results.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-state">Loading profile…</div>

  const isPendingReVerification = profile?.pendingReVerification
  const isVerified = profile?.isVerified && !isPendingReVerification

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="page-header">
          <h1>Doctor Profile</h1>
          <p>{isNew ? 'Complete your profile to start accepting patients' : 'Manage your professional information'}</p>
        </div>

        {/* Status banners */}
        {isNew && (
          <div className="info-banner">
            ℹ️ Please complete all required fields. An admin will verify your profile before you appear to patients.
          </div>
        )}
        {!isNew && isPendingReVerification && (
          <div className="warning-banner">
            ⏳ Your recent profile changes are <strong>pending admin re-verification</strong>. You will not appear in search results until approved.
          </div>
        )}
        {!isNew && !isPendingReVerification && !profile?.isVerified && (
          <div className="warning-banner">
            ⏳ Your profile is pending initial admin verification.
          </div>
        )}
        {isVerified && (
          <div className="success-banner">
            ✓ Your profile is verified and visible to patients.
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit}>

            {/* Row 1 — Name + Email */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name <span className="req">*</span></label>
                <input
                  className="input-field"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Dr. Kamal Perera"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="input-field"
                  name="email"
                  value={form.email}
                  readOnly
                  style={{ opacity: 0.55, cursor: 'not-allowed' }}
                  tabIndex={-1}
                />
              </div>
            </div>

            {/* Row 2 — Phone + Hospital */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Phone <span className="req">*</span></label>
                <input
                  className="input-field"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+94 77 000 0000"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hospital / Clinic <span className="req">*</span></label>
                <input
                  className="input-field"
                  name="hospital"
                  value={form.hospital}
                  onChange={handleChange}
                  placeholder="e.g. Nawaloka Hospital, Colombo"
                  required
                />
              </div>
            </div>

            {/* Row 3 — Specialty + Experience */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Specialty <span className="req">*</span></label>
                <select className="select-field" name="specialty" value={form.specialty} onChange={handleChange} required>
                  <option value="">Select specialty…</option>
                  {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Years of Experience <span className="req">*</span></label>
                <input
                  className="input-field"
                  type="number"
                  name="experience"
                  min="0"
                  max="60"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  required
                />
              </div>
            </div>

            {/* Row 4 — Fee */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Consultation Fee (LKR) <span className="req">*</span></label>
                <input
                  className="input-field"
                  type="number"
                  name="consultationFee"
                  min="0"
                  value={form.consultationFee}
                  onChange={handleChange}
                  placeholder="e.g. 3000"
                  required
                />
              </div>
              <div />
            </div>

            {/* Qualifications */}
            <div className="form-group">
              <label className="form-label">Qualifications <span className="req">*</span></label>
              <input
                className="input-field"
                name="qualifications"
                value={form.qualifications}
                onChange={handleChange}
                placeholder="MBBS, MD, FRCP  (comma-separated)"
                required
              />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 5 }}>
                Enter each qualification separated by a comma
              </div>
            </div>

            {/* Bio */}
            <div className="form-group">
              <label className="form-label">Professional Bio</label>
              <textarea
                className="textarea-field"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="A brief description of your experience and approach to patient care…"
                rows={4}
              />
            </div>

            {/* Available toggle */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={form.isAvailable}
                onChange={handleChange}
                style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <label htmlFor="isAvailable" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                I am currently accepting new patients
              </label>
            </div>

            {error   && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            <div style={{ marginTop: 4, fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              <span className="req">*</span> Required fields
            </div>

            <button
              className="btn btn-accent btn-lg"
              type="submit"
              disabled={saving}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {saving
                ? 'Saving…'
                : isNew
                  ? 'Create Profile'
                  : 'Save Changes — Submit for Re-verification'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .info-banner {
          padding: 14px 18px; border-radius: var(--radius-sm);
          margin-bottom: 20px; font-size: 0.88rem;
          background: var(--info-light); color: var(--info);
        }
        .warning-banner {
          padding: 14px 18px; border-radius: var(--radius-sm);
          margin-bottom: 20px; font-size: 0.88rem;
          background: var(--warning-light); color: var(--warning);
        }
        .success-banner {
          padding: 14px 18px; border-radius: var(--radius-sm);
          margin-bottom: 20px; font-size: 0.88rem;
          background: var(--success-light); color: var(--success);
        }
        .req { color: var(--danger); margin-left: 2px; }
      `}</style>
    </div>
  )
}
