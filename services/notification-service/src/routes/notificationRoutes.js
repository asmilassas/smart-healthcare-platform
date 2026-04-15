const express = require("express");
const {
  sendGenericEmail,
  sendAppointmentConfirmation,
  sendConsultationReminder,
  sendPaymentConfirmation
} = require("../controllers/notificationController");

const router = express.Router();

router.post("/send-email", sendGenericEmail);
router.post("/appointment-confirmation", sendAppointmentConfirmation);
router.post("/consultation-reminder", sendConsultationReminder);
router.post("/payment-confirmation", sendPaymentConfirmation);

module.exports = router;