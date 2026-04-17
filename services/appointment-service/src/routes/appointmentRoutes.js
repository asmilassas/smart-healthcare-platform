const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
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
} = require("../controllers/appointmentController");

const router = express.Router();

// Admin 
router.get("/admin/all", protect, authorize("admin"), getAllAppointments);

// Patient 
// Book a new appointment
router.post("/", protect, authorize("patient"), bookAppointment);

// Get logged-in patient's appointments
router.get("/my", protect, authorize("patient"), getMyAppointments);

// Patient cancels an appointment
router.patch("/:id/cancel", protect, authorize("patient"), cancelAppointment);

// Doctor 
// Get logged-in doctor's appointments
router.get("/doctor/my", protect, authorize("doctor"), getDoctorAppointments);

// Doctor accepts or rejects an appointment
router.patch("/:id/respond", protect, authorize("doctor"), respondToAppointment);

// Doctor marks appointment as completed
router.patch("/:id/complete", protect, authorize("doctor"), completeAppointment);

// Doctor links a prescription to the appointment
router.patch("/:id/prescription", protect, authorize("doctor", "admin"), attachPrescription);

// Payment-service updates payment status (uses admin token)
router.patch("/:id/payment", updatePaymentStatus);

// Telemedicine-service attaches a video room (uses admin or doctor token)
router.patch("/:id/video-room", protect, authorize("admin", "doctor"), attachVideoRoom);

// Any authenticated user can view a single appointment (controller enforces ownership)
router.get("/:id", protect, getAppointmentById);

module.exports = router;