const express = require("express");
const {
  createPatientProfile,
  getPatientProfile,
  updatePatientProfile,
  createPatientReport,
  getPatientReports,
  deletePatientReport
} = require("../controllers/patientController");

const router = express.Router();

router.post("/", createPatientProfile);
router.get("/:userId", getPatientProfile);
router.put("/:userId", updatePatientProfile);

router.post("/:userId/reports", createPatientReport);
router.get("/:userId/reports", getPatientReports);
router.delete("/reports/:reportId", deletePatientReport);

module.exports = router;