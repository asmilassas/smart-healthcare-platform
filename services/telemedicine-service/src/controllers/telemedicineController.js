const TelemedicineSession = require("../models/TelemedicineSession");
const generateMeetingLink = require("../utils/generateMeetingLink");

const createSession = async (req, res) => {
  try {
    const { appointmentId, patientId, doctorId, scheduledDate, notes } = req.body;

    if (!appointmentId || !patientId || !doctorId || !scheduledDate) {
      return res.status(400).json({
        message: "appointmentId, patientId, doctorId, and scheduledDate are required"
      });
    }

    const existingSession = await TelemedicineSession.findOne({ appointmentId });

    if (existingSession) {
      return res.status(400).json({ message: "Session already exists for this appointment" });
    }

    const meetingLink = generateMeetingLink(appointmentId);

    const session = await TelemedicineSession.create({
      appointmentId,
      patientId,
      doctorId,
      meetingLink,
      scheduledDate,
      notes
    });

    res.status(201).json({
      message: "Telemedicine session created successfully",
      session
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSessionByAppointmentId = async (req, res) => {
  try {
    const session = await TelemedicineSession.findOne({
      appointmentId: req.params.appointmentId
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json({
      message: "Telemedicine session fetched successfully",
      session
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const allowedStatuses = ["scheduled", "ongoing", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const session = await TelemedicineSession.findOneAndUpdate(
      { appointmentId: req.params.appointmentId },
      { status },
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json({
      message: "Session status updated successfully",
      session
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSession,
  getSessionByAppointmentId,
  updateSessionStatus
};