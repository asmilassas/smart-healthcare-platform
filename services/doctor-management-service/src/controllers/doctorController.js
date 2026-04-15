const Doctor = require("../models/Doctor");
const Prescription = require("../models/Prescription");

// POST /api/doctors
// Create a doctor profile 
const createDoctorProfile = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      email,
      phone,
      specialty,
      qualifications,
      experience,
      consultationFee,
      bio
    } = req.body;

    if (!userId || !fullName || !email || !specialty || !consultationFee) {
      return res.status(400).json({
        message: "userId, fullName, email, specialty, and consultationFee are required"
      });
    }

    const existing = await Doctor.findOne({ userId });
    if (existing) {
      return res.status(400).json({ message: "Doctor profile already exists" });
    }

    const doctor = await Doctor.create({
      userId,
      fullName,
      email,
      phone,
      specialty,
      qualifications: qualifications || [],
      experience: experience || 0,
      consultationFee,
      bio
    });

    res.status(201).json({
      message: "Doctor profile created successfully",
      doctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors/:userId
// Get a doctor's profile by userId
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.params.userId });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/doctors/:userId
// Update a doctor's own profile
const updateDoctorProfile = async (req, res) => {
  try {
    // Doctors can only update their own profile
    if (req.user.role === "doctor" && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }

    // Prevent changing sensitive fields directly
    const disallowed = ["userId", "isVerified", "rating", "totalRatings"];
    disallowed.forEach((field) => delete req.body[field]);

    const updatedDoctor = await Doctor.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    res.status(200).json({
      message: "Doctor profile updated successfully",
      doctor: updatedDoctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors
// Search / browse all verified doctors
const getAllDoctors = async (req, res) => {
  try {
    const { specialty, name, page = 1, limit = 10 } = req.query;

    const filter = { isVerified: true, isAvailable: true };

    if (specialty) {
      filter.specialty = { $regex: specialty, $options: "i" };
    }
    if (name) {
      filter.fullName = { $regex: name, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Doctor.countDocuments(filter);
    const doctors = await Doctor.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-availability"); 

    res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      doctors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors/:userId/availability
// Get availability slots for a doctor
const getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.params.userId }).select(
      "availability fullName specialty"
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ availability: doctor.availability });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/doctors/:userId/availability
// Set/replace the availability schedule for a doctor
const setDoctorAvailability = async (req, res) => {
  try {
    if (req.user.role === "doctor" && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: "You can only update your own availability" });
    }

    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({ message: "availability must be an array" });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.params.userId },
      { availability },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({
      message: "Availability updated successfully",
      availability: doctor.availability
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/doctors/:userId/verify
// Admin verifies a doctor registration
const verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.params.userId },
      { isVerified: true },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor verified successfully", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors/admin/unverified
// List all unverified doctors pending admin review
const getUnverifiedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isVerified: false });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/doctors/prescriptions
// Doctor issues a digital prescription after consultation
const issuePrescription = async (req, res) => {
  try {
    const { appointmentId, patientId, diagnosis, medications, notes, followUpDate } = req.body;

    if (!appointmentId || !patientId || !diagnosis || !medications) {
      return res.status(400).json({
        message: "appointmentId, patientId, diagnosis, and medications are required"
      });
    }

    const prescription = await Prescription.create({
      appointmentId,
      doctorId: req.user.id,
      patientId,
      diagnosis,
      medications,
      notes,
      followUpDate
    });

    res.status(201).json({
      message: "Prescription issued successfully",
      prescription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

///GET /api/doctors/prescriptions/patient/:patientId
//Fetch prescriptions for a specific patient
const getPrescriptionsByPatient = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patientId: req.params.patientId
    }).sort({ createdAt: -1 });

    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors/prescriptions/appointment/:appointmentId
// Fetch prescription for a specific appointment
const getPrescriptionByAppointment = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      appointmentId: req.params.appointmentId
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.status(200).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
  getAllDoctors,
  getDoctorAvailability,
  setDoctorAvailability,
  verifyDoctor,
  getUnverifiedDoctors,
  issuePrescription,
  getPrescriptionsByPatient,
  getPrescriptionByAppointment
};