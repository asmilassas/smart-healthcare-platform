import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const homeRoute = () => {
    if (!user) return '/'
    if (user.role === 'patient') return '/patient'
    if (user.role === 'doctor') return '/doctor'
    if (user.role === 'admin') return '/admin'
    return '/'
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={homeRoute()} className="navbar-brand">
          <span className="brand-icon">✚</span>
          MediConnect
        </Link>

        <div className="navbar-right">
          {user ? (
            <>
              <span className="navbar-role-tag">{user.role}</span>
              <span className="navbar-user">Hi, {user.name?.split(' ')[0]}</span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>
                Sign in
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
