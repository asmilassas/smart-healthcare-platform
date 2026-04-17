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
  getAllAppointments,
  getBookedSlotsForDoctorByDate,
  mockPayAndConfirmAppointment
} = require("../controllers/appointmentController");

const router = express.Router();

// Adminrouter.patch("/:id/mock-pay", protect, authorize("patient"), mockPayAndConfirmAppointment);
router.get("/admin/all", protect, authorize("admin"), getAllAppointments);

// Public-to-authenticated booking helper for frontend filtering
router.get("/doctor/:doctorId/booked-slots", protect, getBookedSlotsForDoctorByDate);

// Patient
router.post("/", protect, authorize("patient"), bookAppointment);
router.get("/my", protect, authorize("patient"), getMyAppointments);
router.patch("/:id/mock-pay", protect, authorize("patient"), mockPayAndConfirmAppointment);
router.patch("/:id/cancel", protect, authorize("patient"), cancelAppointment);

// Doctor
router.get("/doctor/my", protect, authorize("doctor"), getDoctorAppointments);
router.patch("/:id/respond", protect, authorize("doctor"), respondToAppointment);
router.patch("/:id/complete", protect, authorize("doctor"), completeAppointment);
router.patch("/:id/prescription", protect, authorize("doctor", "admin"), attachPrescription);

// Payment-service updates payment status
router.patch("/:id/payment", protect, authorize("admin"), updatePaymentStatus);

// Telemedicine-service attaches a video room
router.patch("/:id/video-room", protect, authorize("admin", "doctor"), attachVideoRoom);

// Single appointment
router.get("/:id", protect, getAppointmentById);

module.exports = router;