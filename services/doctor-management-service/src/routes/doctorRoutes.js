const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
  getAllDoctors,
  getDoctorAvailability,
  setDoctorAvailability,
  verifyDoctor,
  getUnverifiedDoctors,
  issuePrescription,
  getPrescriptionsByPatient,
  getPrescriptionByAppointment
} = require("../controllers/doctorController");

const router = express.Router();

// Public 
router.get("/", protect, getAllDoctors);
router.post("/", protect, authorize("doctor"), createDoctorProfile);

// Admin endpoints 
router.get("/admin/unverified", protect, authorize("admin"), getUnverifiedDoctors);
router.patch("/:userId/verify", protect, authorize("admin"), verifyDoctor);

// Prescription endpoints 
router.post("/prescriptions", protect, authorize("doctor"), issuePrescription);
router.get(
  "/prescriptions/patient/:patientId",
  protect,
  authorize("doctor", "admin", "patient"),
  getPrescriptionsByPatient
);
router.get(
  "/prescriptions/appointment/:appointmentId",
  protect,
  authorize("doctor", "patient", "admin"),
  getPrescriptionByAppointment
);

// Doctor profile 
router.get("/:userId", protect, getDoctorProfile);
router.put("/:userId", protect, authorize("doctor", "admin"), updateDoctorProfile);

// Availability 
router.get("/:userId/availability", protect, getDoctorAvailability);
router.put("/:userId/availability", protect, authorize("doctor"), setDoctorAvailability);

module.exports = router;