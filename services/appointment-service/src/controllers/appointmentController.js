const axios = require("axios");
const Appointment = require("../models/Appointment");

const fetchDoctorInfo = async (doctorUserId, token) => {
  const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || "http://127.0.0.1:5002";
  const response = await axios.get(
    `${DOCTOR_SERVICE_URL}/api/doctors/${doctorUserId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

const updateSlotStatus = async (doctorUserId, availability, token) => {
  const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || "http://127.0.0.1:5002";
  await axios.put(
    `${DOCTOR_SERVICE_URL}/api/doctors/${doctorUserId}/availability`,
    { availability },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// POST /api/appointments
const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      patientName,
      appointmentDate,
      timeSlot,
      type,
      reasonForVisit
    } = req.body;

    if (!doctorId || !patientName || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        message: "doctorId, patientName, appointmentDate, and timeSlot are required"
      });
    }

    let doctor;
    try {
      const token = req.headers.authorization.split(" ")[1];
      doctor = await fetchDoctorInfo(doctorId, token);
    } catch (err) {
      console.error("fetchDoctorInfo failed:", err.message);
      return res.status(404).json({ message: "Doctor not found or unavailable" });
    }

    if (!doctor.isVerified || doctor.pendingReVerification) {
      return res.status(400).json({
        message: "This doctor is not yet verified or is pending re-verification"
      });
    }

    const bookingDate = new Date(appointmentDate);

    const conflict = await Appointment.findOne({
      doctorId,
      appointmentDate: bookingDate,
      "timeSlot.startTime": timeSlot.startTime,
      status: { $nin: ["cancelled"] }
    });
    if (conflict) {
      return res.status(409).json({ message: "This time slot is already booked" });
    }

    const selfConflict = await Appointment.findOne({
      patientId: req.user.id,
      appointmentDate: bookingDate,
      "timeSlot.startTime": timeSlot.startTime,
      status: { $nin: ["cancelled"] }
    });
    if (selfConflict) {
      return res.status(409).json({ message: "You already have an appointment at this time" });
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      patientName,
      doctorId,
      doctorName: doctor.fullName,
      specialty: doctor.specialty,
      appointmentDate: bookingDate,
      timeSlot,
      type: type || "telemedicine",
      reasonForVisit,
      consultationFee: doctor.consultationFee
    });

    res.status(201).json({
      message: "Appointment booked successfully. Awaiting doctor confirmation.",
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/appointments/my
const getMyAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = { patientId: req.user.id };
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.status(200).json({ total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/appointments/doctor/my
const getDoctorAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = { doctorId: req.user.id };
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.status(200).json({ total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/appointments/:id
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (req.user.role === "patient" && appointment.patientId !== req.user.id)
      return res.status(403).json({ message: "Access denied" });
    if (req.user.role === "doctor" && appointment.doctorId !== req.user.id)
      return res.status(403).json({ message: "Access denied" });
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/appointments/:id/respond
const respondToAppointment = async (req, res) => {
  try {
    const { action, doctorNotes } = req.body;
    if (!["confirm", "cancel"].includes(action))
      return res.status(400).json({ message: "action must be 'confirm' or 'cancel'" });
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.doctorId !== req.user.id)
      return res.status(403).json({ message: "You can only respond to your own appointments" });
    // Check if appointment has been paid for
    if (appointment.paymentStatus !== "paid")
      return res.status(400).json({ message: "Cannot complete unpaid appointment" });
    if (appointment.status !== "pending")
      return res.status(400).json({ message: `Cannot respond to an appointment with status '${appointment.status}'` });
    appointment.status = action === "confirm" ? "confirmed" : "cancelled";
    if (doctorNotes) appointment.doctorNotes = doctorNotes;
    await appointment.save();
    res.status(200).json({ message: `Appointment ${appointment.status} successfully`, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/appointments/:id/cancel
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.patientId !== req.user.id)
      return res.status(403).json({ message: "You can only cancel your own appointments" });
    if (!["pending", "confirmed"].includes(appointment.status))
      return res.status(400).json({ message: `Cannot cancel an appointment with status '${appointment.status}'` });
    appointment.status = "cancelled";
    await appointment.save();
    res.status(200).json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/appointments/:id/complete
const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.doctorId !== req.user.id)
      return res.status(403).json({ message: "Access denied" });
    if (appointment.status !== "confirmed")
      return res.status(400).json({ message: "Only confirmed appointments can be marked as completed" });
    appointment.status = "completed";
    await appointment.save();
    res.status(200).json({ message: "Appointment marked as completed", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/appointments/:id/payment
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    if (!["paid", "refunded"].includes(paymentStatus))
      return res.status(400).json({ message: "Invalid paymentStatus" });
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { paymentStatus, paymentId }, { new: true }
    );
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json({ message: "Payment status updated", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/appointments/:id/video-room
const attachVideoRoom = async (req, res) => {
  try {
    const { videoRoomId } = req.body;
    if (!videoRoomId) return res.status(400).json({ message: "videoRoomId is required" });
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { videoRoomId }, { new: true }
    );
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json({ message: "Video room attached", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/appointments/:id/prescription
const attachPrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.body;
    if (!prescriptionId) return res.status(400).json({ message: "prescriptionId is required" });
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (req.user.role === "doctor" && appointment.doctorId !== req.user.id)
      return res.status(403).json({ message: "Access denied" });
    appointment.prescriptionId = prescriptionId;
    await appointment.save();
    res.status(200).json({ message: "Prescription linked to appointment", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/appointments/admin/all
const getAllAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.status(200).json({ total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  respondToAppointment,
  cancelAppointment,
  completeAppointment,
  updatePaymentStatus,
  attachVideoRoom,
  attachPrescription,
  getAllAppointments
};