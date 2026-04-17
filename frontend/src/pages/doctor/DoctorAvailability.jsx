import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function emptySchedule() {
  return DAYS.map((d) => ({ dayOfWeek: d, slots: [] }))
}

export default function DoctorAvailability() {
  const { user } = useAuth()
  const doctorUserId = user?.id || user?._id

  const [schedule, setSchedule] = useState(emptySchedule())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!doctorUserId) {
      setLoading(false)
      return
    }

    api.getDoctorAvailability(doctorUserId)
      .then((r) => {
        if (r.data?.availability?.length > 0) {
          const merged = DAYS.map((day) => {
            const found = r.data.availability.find((a) => a.dayOfWeek === day)
            return found || { dayOfWeek: day, slots: [] }
          })
          setSchedule(merged)
        } else {
          setSchedule(emptySchedule())
        }
      })
      .catch(() => {
        setSchedule(emptySchedule())
      })
      .finally(() => setLoading(false))
  }, [doctorUserId])

  const addSlot = (dayIdx) => {
    setSchedule((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? {
              ...d,
              slots: [
                ...d.slots,
                { startTime: '09:00', endTime: '09:30', isBooked: false },
              ],
            }
          : d
      )
    )
  }

  const removeSlot = (dayIdx, slotIdx) => {
    setSchedule((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, slots: d.slots.filter((_, si) => si !== slotIdx) }
          : d
      )
    )
  }

  const updateSlot = (dayIdx, slotIdx, field, value) => {
    setSchedule((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? {
              ...d,
              slots: d.slots.map((s, si) =>
                si === slotIdx ? { ...s, [field]: value } : s
              ),
            }
          : d
      )
    )
  }

  const validateSchedule = () => {
    for (const day of schedule) {
      for (const slot of day.slots) {
        if (!slot.startTime || !slot.endTime) {
          return 'All time slots must have both start and end times.'
        }

        if (slot.startTime >= slot.endTime) {
          return `End time must be after start time for ${day.dayOfWeek}.`
        }
      }
    }
    return null
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')

    if (!doctorUserId) {
      setError('User information is not available. Please log in again.')
      return
    }

    const validationError = validateSchedule()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    try {
      const activeDays = schedule.filter((d) => d.slots.length > 0)
      await api.setDoctorAvailability(doctorUserId, { availability: activeDays })
      setSuccess('Availability saved successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save availability.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-state">Loading availability…</div>

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 760 }}>
        <div
          className="page-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <div>
            <h1>Set Availability</h1>
            <p>Configure your weekly schedule and available time slots</p>
          </div>

          <button className="btn btn-accent" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : '✓ Save Schedule'}
          </button>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}
        {success && <div className="success-msg" style={{ marginBottom: 20 }}>{success}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {schedule.map((day, dayIdx) => (
            <div key={day.dayOfWeek} className="card" style={{ padding: '20px 24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: day.slots.length > 0 ? 16 : 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', minWidth: 100 }}>
                    {day.dayOfWeek}
                  </span>

                  {day.slots.length > 0 && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--accent)',
                        background: 'var(--accent-light)',
                        padding: '2px 8px',
                        borderRadius: 99,
                      }}
                    >
                      {day.slots.length} slot{day.slots.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <button className="btn btn-outline btn-sm" onClick={() => addSlot(dayIdx)}>
                  + Add Slot
                </button>
              </div>

              {day.slots.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {day.slots.map((slot, slotIdx) => (
                    <div
                      key={slotIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        background: 'var(--surface-2)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <input
                        type="time"
                        className="input-field"
                        style={{ maxWidth: 130 }}
                        value={slot.startTime}
                        onChange={(e) => updateSlot(dayIdx, slotIdx, 'startTime', e.target.value)}
                      />

                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>to</span>

                      <input
                        type="time"
                        className="input-field"
                        style={{ maxWidth: 130 }}
                        value={slot.endTime}
                        onChange={(e) => updateSlot(dayIdx, slotIdx, 'endTime', e.target.value)}
                      />

                      {slot.isBooked && (
                        <span className="badge badge-confirmed" style={{ fontSize: '0.72rem' }}>
                          Booked
                        </span>
                      )}

                      <button
                        className="btn btn-danger btn-sm"
                        style={{ marginLeft: 'auto' }}
                        onClick={() => removeSlot(dayIdx, slotIdx)}
                        disabled={slot.isBooked}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button className="btn btn-accent btn-lg" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : '✓ Save Availability'}
          </button>
        </div>
      </div>
    </div>
  )
}