import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'

function emptyMed() {
  return { name: '', dosage: '', frequency: '', duration: '' }
}

export default function IssuePrescription() {
  const { appointmentId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    diagnosis: '',
    medications: [emptyMed()],
    notes: '',
    followUpDate: '',
  })

  useEffect(() => {
    if (!appointmentId) {
      setError('Invalid appointment ID.')
      setLoading(false)
      return
    }

    api.getAppointment(appointmentId)
      .then((r) => setAppointment(r.data))
      .catch(() => setError('Could not load appointment.'))
      .finally(() => setLoading(false))
  }, [appointmentId])

  const addMed = () =>
    setForm((f) => ({
      ...f,
      medications: [...f.medications, emptyMed()],
    }))

  const removeMed = (i) =>
    setForm((f) => ({
      ...f,
      medications: f.medications.filter((_, mi) => mi !== i),
    }))

  const updateMed = (i, field, val) =>
    setForm((f) => ({
      ...f,
      medications: f.medications.map((m, mi) =>
        mi === i ? { ...m, [field]: val } : m
      ),
    }))

  const validate = () => {
    if (!form.diagnosis.trim()) return 'Diagnosis is required.'

    for (const med of form.medications) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        return 'All medication fields are required.'
      }
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!appointment) return

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)

    try {
      const rxRes = await api.issuePrescription({
        appointmentId,
        patientId: appointment.patientId,
        diagnosis: form.diagnosis.trim(),
        medications: form.medications,
        notes: form.notes.trim(),
        followUpDate: form.followUpDate || undefined,
      })

      const prescriptionId =
        rxRes.data?.prescription?._id || rxRes.data?._id

      if (!prescriptionId) {
        throw new Error('Invalid prescription response')
      }

      await api.attachPrescription(appointmentId, {
        prescriptionId,
      })

      setSuccess('Prescription issued successfully!')

      setTimeout(() => {
        navigate('/doctor/appointments')
      }, 1500)

    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to issue prescription.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading-state">Loading…</div>

  if (!appointment && error)
    return (
      <div className="error-msg" style={{ margin: '40px auto', maxWidth: 700 }}>
        {error}
      </div>
    )

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 700 }}>
        <button
          className="btn btn-outline btn-sm"
          style={{ marginBottom: 24 }}
          onClick={() => navigate(-1)}
        >
          ← Back to Appointments
        </button>

        <div className="page-header">
          <h1>Issue Prescription</h1>

          {appointment && (
            <p>
              For <strong>{appointment.patientName}</strong> ·{' '}
              {new Date(appointment.appointmentDate).toLocaleDateString(
                'en-LK',
                { day: 'numeric', month: 'long', year: 'numeric' }
              )}
            </p>
          )}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Diagnosis */}
            <div className="form-group">
              <label className="form-label">Diagnosis</label>
              <textarea
                className="textarea-field"
                value={form.diagnosis}
                onChange={(e) =>
                  setForm((f) => ({ ...f, diagnosis: e.target.value }))
                }
                placeholder="Enter diagnosis…"
                rows={2}
                required
              />
            </div>

            <div className="divider" />

            {/* Medications */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <label className="form-label" style={{ margin: 0 }}>
                  Medications
                </label>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={addMed}
                >
                  + Add Medication
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {form.medications.map((med, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '16px 18px',
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        Medication {i + 1}
                      </span>

                      {form.medications.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeMed(i)}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid-2">
                      <input
                        className="input-field"
                        placeholder="Drug Name"
                        value={med.name}
                        onChange={(e) =>
                          updateMed(i, 'name', e.target.value)
                        }
                        required
                      />

                      <input
                        className="input-field"
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) =>
                          updateMed(i, 'dosage', e.target.value)
                        }
                        required
                      />

                      <input
                        className="input-field"
                        placeholder="Frequency"
                        value={med.frequency}
                        onChange={(e) =>
                          updateMed(i, 'frequency', e.target.value)
                        }
                        required
                      />

                      <input
                        className="input-field"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) =>
                          updateMed(i, 'duration', e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider" />

            {/* Follow-up */}
            <div className="form-group">
              <label className="form-label">Follow-up Date (optional)</label>
              <input
                className="input-field"
                type="date"
                value={form.followUpDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    followUpDate: e.target.value,
                  }))
                }
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea
                className="textarea-field"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={3}
              />
            </div>

            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            <button
              className="btn btn-accent btn-lg"
              type="submit"
              disabled={submitting}
              style={{ width: '100%', marginTop: 10 }}
            >
              {submitting ? 'Issuing…' : '💊 Issue Prescription'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}