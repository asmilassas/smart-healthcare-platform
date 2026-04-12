const express = require("express");
const {
  createPatientProfile,
  getPatientProfile,
  updatePatientProfile
} = require("../controllers/patientController");

const router = express.Router();

router.post("/", createPatientProfile);
router.get("/:userId", getPatientProfile);
router.put("/:userId", updatePatientProfile);

module.exports = router;