const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime:   { type: String, required: true },
    isBooked:  { type: Boolean, default: false }
  },
  { _id: true }
);

const availabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      required: true
    },
    slots: [timeSlotSchema]
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    hospital: {
      type: String,
      required: true,
      trim: true
    },
    specialty: {
      type: String,
      required: true,
      trim: true
    },
    qualifications: {
      type: [String],
      default: []
    },
    experience: {
      type: Number,
      required: true,
      default: 0
    },
    consultationFee: {
      type: Number,
      required: true
    },
    bio: {
      type: String,
      trim: true
    },
    profileImage: {
      type: String,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    // True when doctor updates their profile after initial verification —
    // admin must re-verify before the doctor shows up in search results again.
    pendingReVerification: {
      type: Boolean,
      default: false
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    availability: [availabilitySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);