import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import '../../styles/Dashboard.css'
import '../../styles/SymptomChecker.css'

const URGENCY_COLORS = {
  Low:    { badge: 'sc-urgency-low',    icon: '🟢' },
  Medium: { badge: 'sc-urgency-medium', icon: '🟡' },
  High:   { badge: 'sc-urgency-high',   icon: '🔴' },
}

export default function SymptomChecker() {
  const navigate = useNavigate()
  const [symptoms, setSymptoms] = useState('')
  const [result, setResult]     = useState(null)   // raw JSON from API
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const canSubmit = symptoms.trim().length > 0 && !loading

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await api.checkSymptoms({ symptoms: symptoms.trim() })
      setResult(res.data)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Something went wrong. Please try again.'
      setError(typeof msg === 'string' ? msg : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setSymptoms('')
    setResult(null)
    setError('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
  }

  const urgencyStyle = result
    ? URGENCY_COLORS[result.urgencyLevel] ?? { badge: 'sc-urgency-medium', icon: '🟡' }
    : null

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* Header */}
        <div className="page-header">
          <button
            className="btn btn-outline btn-sm sc-back-btn"
            onClick={() => navigate('/patient')}
          >
            ← Back
          </button>
          <h1>🩺 AI Symptom Checker</h1>
          <p>Describe your symptoms and get an instant AI-powered health assessment.</p>
        </div>

        {/* Disclaimer banner */}
        <div className="sc-disclaimer-banner">
          <span className="sc-disclaimer-icon">⚠️</span>
          <p>
            This tool is for <strong>informational purposes only</strong> and does not replace
            professional medical advice. Always consult a qualified doctor for diagnosis and treatment.
          </p>
        </div>

        {/* Input card */}
        <div className="card sc-input-card">
          <h2 className="section-title">Describe Your Symptoms</h2>
          <p className="sc-input-hint">
            Be as specific as possible — include location, severity, and how long you've had them.
            <br />
            <em>Example: "sharp chest pain on the left side, shortness of breath, started 2 hours ago"</em>
          </p>

          <textarea
            className="sc-textarea"
            rows={4}
            placeholder="e.g. nausea, vomiting, sensitivity to light, headache for 3 days…"
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />

          <div className="sc-input-footer">
            <span className="sc-char-count">
              {symptoms.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <div className="sc-actions">
              {(result || error) && (
                <button className="btn btn-outline btn-sm" onClick={handleReset}>
                  Start Over
                </button>
              )}
              <button
                className="btn btn-accent"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {loading ? (
                  <span className="sc-loading-text">
                    <span className="sc-spinner" /> Analysing…
                  </span>
                ) : (
                  'Analyse Symptoms'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="card sc-error-card">
            <span className="sc-error-icon">❌</span>
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="sc-results-wrapper">
            <div className="sc-results-header">
              <h2 className="section-title">Assessment Results</h2>
              <span className="sc-results-tag">AI Generated · Not a diagnosis</span>
            </div>

            {/* Symptom echo */}
            <div className="card sc-symptom-echo">
              <span className="sc-echo-label">Symptoms you described</span>
              <p className="sc-echo-text">"{symptoms.trim()}"</p>
            </div>

            <div className="sc-sections">

              {/* Urgency Level */}
              <div className="card sc-section-card">
                <div className="sc-section-heading">
                  <span className="sc-section-icon">⚡</span>
                  <h3>Urgency Level</h3>
                </div>
                <div className={`sc-urgency-badge ${urgencyStyle.badge}`}>
                  {urgencyStyle.icon} {result.urgencyLevel}
                </div>
              </div>

              {/* Possible Conditions */}
              <div className="card sc-section-card">
                <div className="sc-section-heading">
                  <span className="sc-section-icon">🔬</span>
                  <h3>Possible Conditions</h3>
                </div>
                <ul className="sc-section-items">
                  {result.possibleConditions.map((condition, i) => (
                    <li key={i} className="sc-section-item">{condition}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Specialties */}
              <div className="card sc-section-card">
                <div className="sc-section-heading">
                  <span className="sc-section-icon">👨‍⚕️</span>
                  <h3>Recommended Specialties</h3>
                </div>
                <ul className="sc-section-items">
                  {result.recommendedSpecialties.map((specialty, i) => (
                    <li key={i} className="sc-section-item">{specialty}</li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="card sc-section-card sc-disclaimer-card">
                <div className="sc-section-heading">
                  <span className="sc-section-icon">⚠️</span>
                  <h3>Disclaimer</h3>
                </div>
                <p className="sc-disclaimer-text">{result.disclaimer}</p>
              </div>

            </div>

            {/* CTA */}
            <div className="card sc-cta-card">
              <div className="sc-cta-content">
                <span className="sc-cta-icon">👨‍⚕️</span>
                <div>
                  <strong>Want a professional opinion?</strong>
                  <p>Book an appointment with a specialist based on your symptoms.</p>
                </div>
              </div>
              <button
                className="btn btn-accent"
                onClick={() => navigate('/patient/doctors')}
              >
                Find a Doctor →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}