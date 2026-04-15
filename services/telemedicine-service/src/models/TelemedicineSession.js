const mongoose = require("mongoose");

const telemedicineSessionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true
    },
    patientId: {
      type: String,
      required: true
    },
    doctorId: {
      type: String,
      required: true
    },
    meetingLink: {
      type: String,
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled"
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TelemedicineSession", telemedicineSessionSchema);