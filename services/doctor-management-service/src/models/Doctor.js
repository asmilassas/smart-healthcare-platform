const mongoose = require("mongoose");

// Availability slot schema: each day can have multiple time slots
const timeSlotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true }, 
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false }
  },
  { _id: true }
);

const availabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true
    },
    slots: [timeSlotSchema]
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    // Links to the User document in auth-service
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
      default: false // Admin must verify the doctor
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    availability: [availabilitySchema],
    rating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);