import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './LandingPage.css'

const features = [
  { icon: '🩺', title: 'Book Appointments', desc: 'Search doctors by specialty and book in seconds.' },
  { icon: '📹', title: 'Video Consultations', desc: 'Attend secure telemedicine sessions from anywhere.' },
  { icon: '📋', title: 'Digital Prescriptions', desc: 'Receive and store prescriptions digitally.' },
  { icon: '🤖', title: 'AI Symptom Checker', desc: 'Get preliminary health suggestions before your visit.' },
  { icon: '💳', title: 'Secure Payments', desc: 'Pay consultation fees safely via PayHere or Stripe.' },
  { icon: '🔔', title: 'Smart Notifications', desc: 'SMS and email reminders for every appointment.' },
]

const specialties = [
  'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics',
  'Orthopedics', 'Psychiatry', 'Oncology', 'General Medicine',
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleGetStarted = () => {
    if (!user) return navigate('/register')
    if (user.role === 'patient') return navigate('/patient')
    if (user.role === 'doctor') return navigate('/doctor')
    if (user.role === 'admin') return navigate('/admin')
  }

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content container">
          <div className="hero-text">
            <span className="hero-pill">Sri Lanka's Smart Healthcare Platform</span>
            <h1 className="hero-title">
              Healthcare,<br />
              <em>Reimagined.</em>
            </h1>
            <p className="hero-sub">
              Book doctors, attend video consultations, receive digital
              prescriptions — all in one secure platform.
            </p>
            <div className="hero-actions">
              <button className="btn btn-accent btn-lg" onClick={handleGetStarted}>
                Get started →
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>
                Sign in
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card-stack">
              <div className="hcard hcard-1">
                <div className="hcard-icon">👨‍⚕️</div>
                <div>
                  <div className="hcard-name">Dr. Perera</div>
                  <div className="hcard-spec">Cardiologist</div>
                </div>
                <span className="badge badge-confirmed">Available</span>
              </div>
              <div className="hcard hcard-2">
                <div className="hcard-label">Next appointment</div>
                <div className="hcard-time">Today · 2:30 PM</div>
                <div className="hcard-tag">📹 Telemedicine</div>
              </div>
              <div className="hcard hcard-3">
                <div className="hcard-label">Prescription ready</div>
                <div className="hcard-rx">Rx — Amoxicillin 500mg</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="specialties-section container">
        <p className="section-eyebrow">Specialties</p>
        <div className="specialties-row">
          {specialties.map(s => (
            <span key={s} className="specialty-chip" onClick={() => navigate('/register')}>
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section container">
        <p className="section-eyebrow">Platform Features</p>
        <h2 className="section-heading">Everything you need in one place</h2>
        <div className="grid-3 features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section container">
        <div className="cta-box">
          <h2>Ready to take control of your health?</h2>
          <p>Join thousands of patients and doctors on MediConnect.</p>
          <button className="btn btn-accent btn-lg" onClick={() => navigate('/register')}>
            Create a free account
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <span className="brand-icon" style={{ marginRight: 8 }}>✚</span>
          MediConnect · SE3020 Distributed Systems Project · 2026
        </div>
      </footer>
    </div>
  )
}
