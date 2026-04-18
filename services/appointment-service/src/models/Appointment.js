const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true
    },
    patientName: {
      type: String,
      required: true
    },
    patientEmail: {
      type: String,
      default: null
    },
    patientPhone: {
      type: String,
      default: null
    },
    reportImages: {
      type: [String],
      default: []
    },
    doctorId: {
      type: String,
      required: true
    },
    doctorName: {
      type: String,
      required: true
    },
    specialty: {
      type: String,
      required: true
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    timeSlot: {
      startTime: { type: String, required: true }, 
      endTime: { type: String, required: true } 
    },
    type: {
      type: String,
      enum: ["in-person", "telemedicine"],
      default: "telemedicine"
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no-show"],
      default: "pending"
    },
    doctorNotes: {
      type: String,
      trim: true
    },
    reasonForVisit: {
      type: String,
      trim: true
    },
    prescriptionId: {
      type: String,
      default: null
    },
    consultationFee: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid"
    },
    paymentId: {
      type: String,
      default: null
    },
    videoRoomId: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);