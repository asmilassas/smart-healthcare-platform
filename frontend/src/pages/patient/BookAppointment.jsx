import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

function getDayName(dateStr) {
  const d = new Date(dateStr)
  const jsDay = d.getDay()
  const idx = jsDay === 0 ? 6 : jsDay - 1
  return DAYS[idx]
}

export default function BookAppointment() {
  const { doctorId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [doctor, setDoctor] = useState(null)
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    appointmentDate: '',
    selectedDay: '',
    selectedSlot: null,
    type: 'telemedicine',
    reasonForVisit: '',
    patientPhone: '',
    reportImages: [],
  })

  useEffect(() => {
    Promise.all([
      api.getDoctor(doctorId),
      api.getDoctorAvailability(doctorId),
    ])
      .then(([dr, av]) => {
        setDoctor(dr.data)
        setAvailability(av.data?.availability || [])
      })
      .catch(() => setError('Could not load doctor information. Please go back and try again.'))
      .finally(() => setLoading(false))
  }, [doctorId])

  const handleDateChange = e => {
    const date = e.target.value
    const dayName = getDayName(date)
    setForm(f => ({ ...f, appointmentDate: date, selectedDay: dayName, selectedSlot: null }))
  }

  const handleImageUpload = e => {
    const files = Array.from(e.target.files)
    if (files.length + form.reportImages.length > 5) {
      setError('You can upload a maximum of 5 images.')
      return
    }
    setError('')
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm(f => ({ ...f, reportImages: [...f.reportImages, reader.result] }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = idx => {
    setForm(f => ({ ...f, reportImages: f.reportImages.filter((_, i) => i !== idx) }))
  }

  const slotsForDay = (availability.find(a => a.dayOfWeek === form.selectedDay)?.slots || [])
    .filter(s => !s.isBooked)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.selectedSlot) return setError('Please select a time slot.')
    if (!form.patientPhone.trim()) return setError('Please enter your phone number.')
    setError('')
    setSubmitting(true)
    try {
      const cleanSlot = {
        startTime: form.selectedSlot.startTime,
        endTime:   form.selectedSlot.endTime,
      }

      await api.bookAppointment({
        doctorId,
        patientName: user.name,
        patientPhone: form.patientPhone.trim(),
        appointmentDate: form.appointmentDate,
        timeSlot: cleanSlot,
        type: form.type,
        reasonForVisit: form.reasonForVisit,
        reportImages: form.reportImages,
      })

      setSuccess('Appointment booked successfully! Awaiting doctor confirmation.')
      setTimeout(() => navigate('/patient/appointments'), 2500)
    } catch (err) {
      const msg = err.response?.data?.message
      setError(msg || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading-state">Loading doctor information…</div>
  if (!doctor) return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="error-msg" style={{ marginTop: 40 }}>{error || 'Doctor not found.'}</div>
        <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>← Back</button>
      </div>
    </div>
  )

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 700 }}>

        <button className="btn btn-outline btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
              background: 'var(--accent-light)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1.5rem',
            }}>
              {doctor.fullName?.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 4 }}>
                {doctor.fullName}
              </h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{doctor.specialty}</span>
                {doctor.hospital && <span>🏥 {doctor.hospital}</span>}
                <span>🎓 {doctor.experience} yrs exp</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>LKR {doctor.consultationFee?.toLocaleString()} / session</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Book Appointment</h2>

          <form onSubmit={handleSubmit}>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Appointment Date</label>
                <input
                  className="input-field"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.appointmentDate}
                  onChange={handleDateChange}
                  required
                />
                {form.selectedDay && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 5 }}>
                    {form.selectedDay}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Consultation Type</label>
                <select
                  className="select-field"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  <option value="telemedicine">📹 Video (Telemedicine)</option>
                  <option value="in-person">🏥 In-person</option>
                </select>
              </div>
            </div>

            {form.appointmentDate && (
              <div className="form-group">
                <label className="form-label">Available Time Slots — {form.selectedDay}</label>
                {slotsForDay.length === 0 ? (
                  <div style={{
                    padding: '14px 16px', background: 'var(--surface-2)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                    fontSize: '0.88rem', color: 'var(--text-muted)'
                  }}>
                    No available slots on {form.selectedDay}. Please choose a different date.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                    {slotsForDay.map(slot => {
                      const isSelected = form.selectedSlot?.startTime === slot.startTime
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, selectedSlot: slot }))}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-sm)',
                            border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                            background: isSelected ? 'var(--accent)' : 'var(--surface)',
                            color: isSelected ? '#fff' : 'var(--text)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        >
                          {slot.startTime} – {slot.endTime}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Phone Number <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                className="input-field"
                type="tel"
                placeholder="e.g. 0771234567"
                value={form.patientPhone}
                onChange={e => setForm(f => ({ ...f, patientPhone: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Visit</label>
              <textarea
                className="textarea-field"
                placeholder="Briefly describe your symptoms or reason for the appointment…"
                value={form.reasonForVisit}
                onChange={e => setForm(f => ({ ...f, reasonForVisit: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Reports / Images <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>(optional, max 5)</span></label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="report-upload"
              />
              <label
                htmlFor="report-upload"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '9px 18px', borderRadius: 'var(--radius-sm)',
                  border: '1.5px dashed var(--border)', cursor: 'pointer',
                  fontSize: '0.88rem', color: 'var(--text-muted)',
                  background: 'var(--surface-2)', transition: 'all 0.15s',
                }}
              >
                📎 Choose images
              </label>
              {form.reportImages.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                  {form.reportImages.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img
                        src={img}
                        alt={`report-${idx}`}
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        style={{
                          position: 'absolute', top: -6, right: -6,
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'var(--danger)', color: '#fff',
                          border: 'none', cursor: 'pointer',
                          fontSize: '0.7rem', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, lineHeight: 1,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {form.selectedSlot && (
              <div style={{
                background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)',
                padding: '16px 20px', margin: '4px 0 16px',
                border: '1px solid var(--border)',
              }}>
                {[
                  ['Doctor', doctor.fullName],
                  ['Hospital', doctor.hospital || '—'],
                  ['Date', new Date(form.appointmentDate + 'T00:00:00').toDateString()],
                  ['Time', `${form.selectedSlot.startTime} – ${form.selectedSlot.endTime}`],
                  ['Type', form.type === 'telemedicine' ? '📹 Telemedicine' : '🏥 In-person'],
                ].map(([label, val]) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '7px 0', fontSize: '0.9rem',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span>{val}</span>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '10px 0 0', fontSize: '1rem', fontWeight: 700,
                }}>
                  <span>Consultation Fee</span>
                  <span>LKR {doctor.consultationFee?.toLocaleString()}</span>
                </div>
              </div>
            )}

            {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}
            {success && <div className="success-msg" style={{ marginBottom: 12 }}>{success}</div>}

            <button
              className="btn btn-accent btn-lg"
              type="submit"
              disabled={submitting || !form.selectedSlot || !!success}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {submitting ? 'Confirming booking…' : 'Confirm Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}