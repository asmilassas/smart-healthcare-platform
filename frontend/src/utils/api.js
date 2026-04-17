import axios from 'axios'

// Proxy routes (vite.config.js):
// /api/auth -> auth-service
// /api/patients -> patient-service
// /api/doctors -> doctor-service
// /api/appointments -> appointment-service

function makeClient(baseURL) {
  const client = axios.create({ baseURL })

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('mc_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return client
}

const client = makeClient('')

export const api = {
  // Auth Service
  register: (data) => client.post('/api/auth/register', data),
  verifyOtp: (data) => client.post('/api/auth/verify-otp', data),
  login: (data) => client.post('/api/auth/login', data),
  getProfile: () => client.get('/api/auth/profile'),
  changeUserRole: (id, data) => client.patch(`/api/auth/users/${id}/role`, data),
  getPendingDoctors: () => client.get('/api/auth/doctors/pending'),
  approveDoctor: (id) => client.patch(`/api/auth/doctors/${id}/approve`),
  rejectDoctor: (id) => client.patch(`/api/auth/doctors/${id}/reject`),
  getAllUsers: () => client.get('/api/auth/users'),

  // Patient Service
  createPatientProfile: (data) => client.post('/api/patients', data),
  getPatientProfile: (userId) => client.get(`/api/patients/${userId}`),
  updatePatientProfile: (userId, data) => client.put(`/api/patients/${userId}`, data),

  // Doctor Management Service
  getDoctors: () => client.get('/api/doctors'),
  getAllDoctorsAdmin: () => client.get('/api/doctors/admin/all-doctors'),
  getDoctor: (userId) => client.get(`/api/doctors/${userId}`),
  createDoctorProfile: (data) => client.post('/api/doctors', data),
  updateDoctorProfile: (userId, data) => client.put(`/api/doctors/${userId}`, data),
  getDoctorAvailability: (userId) => client.get(`/api/doctors/${userId}/availability`),
  setDoctorAvailability: (userId, data) => client.put(`/api/doctors/${userId}/availability`, data),
  getUnverifiedDoctors: () => client.get('/api/doctors/admin/unverified'),
  verifyDoctor: (userId) => client.patch(`/api/doctors/${userId}/verify`),
  issuePrescription: (data) => client.post('/api/doctors/prescriptions', data),
  getPrescriptionsByPatient: (pid) => client.get(`/api/doctors/prescriptions/patient/${pid}`),
  getPrescriptionByAppointment: (aid) => client.get(`/api/doctors/prescriptions/appointment/${aid}`),

  // Appointment Service
  bookAppointment: (data) => client.post('/api/appointments', data),
  getMyAppointments: () => client.get('/api/appointments/my'),
  getDoctorAppointments: () => client.get('/api/appointments/doctor/my'),
  getAllAppointments: () => client.get('/api/appointments/admin/all'),
  getAppointment: (id) => client.get(`/api/appointments/${id}`),
  respondToAppointment: (id, data) => client.patch(`/api/appointments/${id}/respond`, data),
  cancelAppointment: (id) => client.patch(`/api/appointments/${id}/cancel`),
  completeAppointment: (id) => client.patch(`/api/appointments/${id}/complete`),
  attachPrescription: (id, data) => client.patch(`/api/appointments/${id}/prescription`, data),
  attachVideoRoom: (id, data) => client.patch(`/api/appointments/${id}/video-room`, data),
  updatePaymentStatus: (id, data) => client.patch(`/api/appointments/${id}/payment`, data),

  //new
  getDoctorBookedSlots: (doctorId, date) =>
  client.get(`/api/appointments/doctor/${doctorId}/booked-slots?date=${date}`),
  mockPayAppointment: (id, data) =>
  client.patch(`/api/appointments/${id}/mock-pay`, data),
}