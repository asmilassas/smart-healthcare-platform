const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
  getAllDoctors,
  getAllDoctorsAdmin,
  getDoctorAvailability,
  setDoctorAvailability,
  verifyDoctor,
  getUnverifiedDoctors,
  issuePrescription,
  getPrescriptionsByPatient,
  getPrescriptionByAppointment
} = require("../controllers/doctorController");

const router = express.Router();

// Browseable doctors (verified + available only)
router.get("/", protect, getAllDoctors);
router.post("/", protect, authorize("doctor"), createDoctorProfile);

// Admin endpoints — must come BEFORE /:userId to avoid route collision
router.get("/admin/unverified", protect, authorize("admin"), getUnverifiedDoctors);
router.get("/admin/all-doctors", protect, authorize("admin"), getAllDoctorsAdmin);
router.patch("/:userId/verify", protect, authorize("admin"), verifyDoctor);

// Prescription endpoints — must come BEFORE /:userId
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

// Doctor profile — /:userId must come AFTER all fixed paths
router.get("/:userId", protect, getDoctorProfile);
router.put("/:userId", protect, authorize("doctor", "admin"), updateDoctorProfile);

// Availability
router.get("/:userId/availability", protect, getDoctorAvailability);
router.put("/:userId/availability", protect, authorize("doctor"), setDoctorAvailability);

module.exports = router;
