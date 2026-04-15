const express = require("express");
const {
  createSession,
  getSessionByAppointmentId,
  updateSessionStatus
} = require("../controllers/telemedicineController");

const router = express.Router();

router.post("/session", createSession);
router.get("/session/:appointmentId", getSessionByAppointmentId);
router.put("/session/:appointmentId/status", updateSessionStatus);

module.exports = router;