const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String }
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true
    },
    doctorId: {
      type: String,
      required: true
    },
    patientId: {
      type: String,
      required: true
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true
    },
    medications: [medicationSchema],
    notes: {
      type: String,
      trim: true
    },
    followUpDate: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);