import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard'
import BrowseDoctors from './pages/patient/BrowseDoctors'
import BookAppointment from './pages/patient/BookAppointment'
import MyAppointments from './pages/patient/MyAppointments'
import MyPrescriptions from './pages/patient/MyPrescriptions'
import PatientProfile from './pages/patient/PatientProfile'

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorAvailability from './pages/doctor/DoctorAvailability'
import DoctorProfile from './pages/doctor/DoctorProfile'
import IssuePrescription from './pages/doctor/IssuePrescription'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import VerifyDoctors from './pages/admin/VerifyDoctors'
import AllAppointments from './pages/admin/AllAppointments'
import UserManagement from './pages/admin/UserManagement'

// AI Symptom pages
import SymptomChecker from './pages/patient/SymptomChecker'

// Payment Gateway
import PaymentGateway from './pages/patient/Paymentgateway'
import PaymentResult from './pages/patient/PaymentResult'

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Patient */}
        <Route path="/patient" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/doctors" element={<ProtectedRoute roles={['patient']}><BrowseDoctors /></ProtectedRoute>} />
        <Route path="/patient/book/:doctorId" element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />
        <Route path="/patient/appointments" element={<ProtectedRoute roles={['patient']}><MyAppointments /></ProtectedRoute>} />
        <Route path="/patient/prescriptions" element={<ProtectedRoute roles={['patient']}><MyPrescriptions /></ProtectedRoute>} />
        <Route path="/patient/profile" element={<ProtectedRoute roles={['patient']}><PatientProfile /></ProtectedRoute>} />
        <Route path="/patient/symptom-checker" element={<SymptomChecker />} />
        <Route path="/patient/payment" element={<PaymentGateway />} />
        <Route path="/patient/payment/result" element={<PaymentResult />} />

        {/* Doctor */}
        <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute roles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
        <Route path="/doctor/availability" element={<ProtectedRoute roles={['doctor']}><DoctorAvailability /></ProtectedRoute>} />
        <Route path="/doctor/profile" element={<ProtectedRoute roles={['doctor']}><DoctorProfile /></ProtectedRoute>} />
        <Route path="/doctor/prescribe/:appointmentId" element={<ProtectedRoute roles={['doctor']}><IssuePrescription /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/verify-doctors" element={<ProtectedRoute roles={['admin']}><VerifyDoctors /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute roles={['admin']}><AllAppointments /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}