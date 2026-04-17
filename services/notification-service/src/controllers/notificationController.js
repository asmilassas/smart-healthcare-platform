const sendEmail = require("../utils/sendEmail");

const sendGenericEmail = async (req, res) => {
  try {
    const { to, subject, text, message } = req.body;

    const finalMessage = text || message;

    if (!to || !subject || !finalMessage) {
      return res.status(400).json({ message: "to, subject, and text are required" });
    }

    await sendEmail({
      to,
      subject,
      html: `<p>${finalMessage}</p>`
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email controller error:", error);
    res.status(500).json({ message: error.message });
  }
};

const sendAppointmentConfirmation = async (req, res) => {
  try {
    const { to, patientName, doctorName, appointmentDate, appointmentTime } = req.body;

    if (!to || !patientName || !doctorName || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: "All appointment confirmation fields are required" });
    }

    await sendEmail({
      to,
      subject: "Appointment Confirmation",
      html: `
        <h2>Appointment Confirmed</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment with <strong>${doctorName}</strong> has been confirmed.</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
      `
    });

    res.status(200).json({ message: "Appointment confirmation email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendConsultationReminder = async (req, res) => {
  try {
    const { to, patientName, doctorName, appointmentDate, appointmentTime, meetingLink } = req.body;

    if (!to || !patientName || !doctorName || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: "All consultation reminder fields are required" });
    }

    await sendEmail({
      to,
      subject: "Consultation Reminder",
      html: `
        <h2>Consultation Reminder</h2>
        <p>Dear ${patientName},</p>
        <p>This is a reminder for your consultation with <strong>${doctorName}</strong>.</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}
      `
    });

    res.status(200).json({ message: "Consultation reminder email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendPaymentConfirmation = async (req, res) => {
  try {
    const { to, patientName, amount, paymentDate, paymentMethod } = req.body;

    if (!to || !patientName || !amount || !paymentDate || !paymentMethod) {
      return res.status(400).json({ message: "All payment confirmation fields are required" });
    }

    await sendEmail({
      to,
      subject: "Payment Confirmation",
      html: `
        <h2>Payment Successful</h2>
        <p>Dear ${patientName},</p>
        <p>Your payment has been completed successfully.</p>
        <p><strong>Amount:</strong> ${amount}</p>
        <p><strong>Date:</strong> ${paymentDate}</p>
        <p><strong>Method:</strong> ${paymentMethod}</p>
      `
    });

    res.status(200).json({ message: "Payment confirmation email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendGenericEmail,
  sendAppointmentConfirmation,
  sendConsultationReminder,
  sendPaymentConfirmation
};