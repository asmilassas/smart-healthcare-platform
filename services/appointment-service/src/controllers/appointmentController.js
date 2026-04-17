const axios = require("axios");
const Appointment = require("../models/Appointment");

const DOCTOR_SERVICE_URL =
  process.env.DOCTOR_SERVICE_URL || "http://doctor-service:5002";

const TELEMEDICINE_SERVICE_URL =
  process.env.TELEMEDICINE_SERVICE_URL || "http://telemedicine-service:5004";

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:5005";

const fetchDoctorInfo = async (doctorUserId, token) => {
  const response = await axios.get(
    `${DOCTOR_SERVICE_URL}/api/doctors/${doctorUserId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
};

const updateSlotStatus = async (doctorUserId, availability, token) => {
  await axios.put(
    `${DOCTOR_SERVICE_URL}/api/doctors/${doctorUserId}/availability`,
    { availability },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

const createTelemedicineSession = async (appointment, token) => {
  const response = await axios.post(
    `${TELEMEDICINE_SERVICE_URL}/api/telemedicine/session`,
    {
      appointmentId: appointment._id.toString(),
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      doctorName: appointment.doctorName,
      patientName: appointment.patientName,
      scheduledDate: appointment.appointmentDate
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

const sendEmailNotification = async ({ to, subject, text }) => {
  try {
    if (!to) return;

    await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send-email`, {
      to,
      subject,
      text
    });
  } catch (error) {
    console.error(
      "Email notification failed:",
      error.response?.data || error.message
    );
  }
};

// POST /api/appointments
const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      patientName,
      patientEmail,
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
      console.error("fetchDoctorInfo failed:", err.response?.data || err.message);
      return res.status(404).json({
        message: "Doctor not found or unavailable"
      });
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
      status: "confirmed",
      paymentStatus: "paid"
    });

    if (conflict) {
      return res.status(409).json({
        message: "This slot has already been secured by another patient"
      });
    }

    const selfConflict = await Appointment.findOne({
      patientId: req.user.id,
      appointmentDate: bookingDate,
      "timeSlot.startTime": timeSlot.startTime,
      status: { $nin: ["cancelled"] }
    });

    if (selfConflict) {
      return res.status(409).json({
        message: "You already have an appointment at this time"
      });
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      patientName,
      patientEmail,
      doctorId,
      doctorName: doctor.fullName,
      specialty: doctor.specialty,
      appointmentDate: bookingDate,
      timeSlot,
      type: type || "telemedicine",
      reasonForVisit,
      consultationFee: doctor.consultationFee,
      status: "pending",
      paymentStatus: "unpaid"
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

    res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      appointments
    });
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

    res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      appointments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/appointments/:id
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (req.user.role === "patient" && appointment.patientId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.user.role === "doctor" && appointment.doctorId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/appointments/:id/respond
const respondToAppointment = async (req, res) => {
  try {
    const { action, doctorNotes } = req.body;

    if (!["confirm", "cancel"].includes(action)) {
      return res.status(400).json({
        message: "action must be 'confirm' or 'cancel'"
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.doctorId !== req.user.id) {
      return res.status(403).json({
        message: "You can only respond to your own appointments"
      });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({
        message: `Cannot respond to an appointment with status '${appointment.status}'`
      });
    }

    appointment.status = action === "confirm" ? "confirmed" : "cancelled";

    if (doctorNotes) {
      appointment.doctorNotes = doctorNotes;
    }

    await appointment.save();

    const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString("en-LK");
    const timeText = `${appointment.timeSlot?.startTime} - ${appointment.timeSlot?.endTime}`;

    if (action === "confirm") {
      await sendEmailNotification({
        to: appointment.patientEmail,
        subject: "Appointment Confirmed",
        text: `Hello ${appointment.patientName},

Your appointment with Dr. ${appointment.doctorName} has been confirmed.

Date: ${formattedDate}
Time: ${timeText}
Type: ${appointment.type}

Please complete your payment to secure the appointment slot.

Thank you.`
      });
    } else {
      await sendEmailNotification({
        to: appointment.patientEmail,
        subject: "Appointment Rejected",
        text: `Hello ${appointment.patientName},

Your appointment with Dr. ${appointment.doctorName} has been rejected/cancelled.

Date: ${formattedDate}
Time: ${timeText}

Please book another appointment if needed.

Thank you.`
      });
    }

    res.status(200).json({
      message: `Appointment ${appointment.status} successfully`,
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/appointments/:id/cancel
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({
        message: "You can only cancel your own appointments"
      });
    }

    if (!["pending", "confirmed"].includes(appointment.status)) {
      return res.status(400).json({
        message: `Cannot cancel an appointment with status '${appointment.status}'`
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/appointments/:id/complete
const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.doctorId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (appointment.status !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed appointments can be marked as completed"
      });
    }

    if (appointment.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Only paid appointments can be marked as completed"
      });
    }

    appointment.status = "completed";
    await appointment.save();

    res.status(200).json({
      message: "Appointment marked as completed",
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/appointments/:id/payment
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;

    if (!["paid", "refunded"].includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid paymentStatus" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentId },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({
      message: "Payment status updated",
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/appointments/:id/video-room
const attachVideoRoom = async (req, res) => {
  try {
    const { videoRoomId } = req.body;

    if (!videoRoomId) {
      return res.status(400).json({ message: "videoRoomId is required" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { videoRoomId },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({
      message: "Video room attached",
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/appointments/:id/prescription
const attachPrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.body;

    if (!prescriptionId) {
      return res.status(400).json({ message: "prescriptionId is required" });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (req.user.role === "doctor" && appointment.doctorId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    appointment.prescriptionId = prescriptionId;
    await appointment.save();

    res.status(200).json({
      message: "Prescription linked to appointment",
      appointment
    });
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

    res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      appointments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/appointments/doctor/:doctorId/booked-slots?date=YYYY-MM-DD
const getBookedSlotsForDoctorByDate = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date query is required" });
    }

    const targetDate = new Date(date);

    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: targetDate,
      status: "confirmed",
      paymentStatus: "paid"
    }).select("timeSlot");

    const bookedSlots = bookedAppointments.map((a) => ({
      startTime: a.timeSlot.startTime,
      endTime: a.timeSlot.endTime
    }));

    return res.status(200).json({ bookedSlots });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /api/appointments/:id/mock-pay
const mockPayAndConfirmAppointment = async (req, res) => {
  try {
    const { onsiteDetails } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({
        message: "You can only pay for your own appointment"
      });
    }

    if (appointment.status !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed appointments can be paid"
      });
    }

    if (appointment.paymentStatus === "paid") {
      return res.status(400).json({
        message: "This appointment is already paid"
      });
    }

    const paidConflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctorId: appointment.doctorId,
      appointmentDate: appointment.appointmentDate,
      "timeSlot.startTime": appointment.timeSlot.startTime,
      status: "confirmed",
      paymentStatus: "paid"
    });

    if (paidConflict) {
      return res.status(409).json({
        message: "This slot has already been secured by another patient."
      });
    }

    appointment.paymentStatus = "paid";
    appointment.paymentId = "TEMP-MOCK-PAYMENT";

    if (appointment.type === "telemedicine") {
      const token = req.headers.authorization?.split(" ")[1];

      try {
        appointment.videoRoomId = `mediconnect-${appointment._id}`;
        appointment.meetingLink = `https://meet.jit.si/${appointment.videoRoomId}`;

        if (token) {
          const telemedicineData = await createTelemedicineSession(appointment, token);

          appointment.videoRoomId =
            telemedicineData?.videoRoomId || appointment.videoRoomId;

          appointment.meetingLink =
            telemedicineData?.meetingLink || appointment.meetingLink;
        }
      } catch (teleError) {
        console.error(
          "Telemedicine session creation failed:",
          teleError.response?.data || teleError.message
        );
      }
    } else {
      appointment.onsiteDetails =
        onsiteDetails || "Please visit the hospital/clinic at the selected time.";
    }

    await appointment.save();

    const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString("en-LK");
    const timeText = `${appointment.timeSlot?.startTime} - ${appointment.timeSlot?.endTime}`;

    await sendEmailNotification({
      to: appointment.patientEmail,
      subject: "Payment Successful",
      text:
        appointment.type === "telemedicine"
          ? `Hello ${appointment.patientName},

Your payment was successful for the appointment with Dr. ${appointment.doctorName}.

Date: ${formattedDate}
Time: ${timeText}
Meeting Link: ${appointment.meetingLink}

Thank you.`
          : `Hello ${appointment.patientName},

Your payment was successful for the appointment with Dr. ${appointment.doctorName}.

Date: ${formattedDate}
Time: ${timeText}
Onsite Details: ${appointment.onsiteDetails}

Thank you.`
    });

    return res.status(200).json({
      message: "Payment successful. Appointment secured.",
      appointment
    });
  } catch (error) {
    console.error(
      "mockPayAndConfirmAppointment error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: error.response?.data?.message || error.message || "Payment failed"
    });
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
  getAllAppointments,
  getBookedSlotsForDoctorByDate,
  mockPayAndConfirmAppointment
};