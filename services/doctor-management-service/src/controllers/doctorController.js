const Doctor = require("../models/Doctor");
const Prescription = require("../models/Prescription");

// POST /api/doctors
const createDoctorProfile = async (req, res) => {
  try {
    const {
      userId, fullName, email, phone, hospital,
      specialty, qualifications, experience, consultationFee, bio
    } = req.body;

    // All required fields must be present
    if (!userId || !fullName || !email || !phone || !hospital || !specialty || !consultationFee || experience === undefined || experience === "") {
      return res.status(400).json({
        message: "userId, fullName, email, phone, hospital, specialty, experience, and consultationFee are all required"
      });
    }

    if ((qualifications || []).length === 0) {
      return res.status(400).json({ message: "At least one qualification is required" });
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
      hospital,
      specialty,
      qualifications,
      experience: Number(experience),
      consultationFee: Number(consultationFee),
      bio,
      isVerified: false,
      pendingReVerification: false
    });

    res.status(201).json({ message: "Doctor profile created successfully", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors/:userId
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.params.userId });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/doctors/:userId
// Any profile update resets isVerified to false and flags pendingReVerification.
const updateDoctorProfile = async (req, res) => {
  try {
    if (req.user.role === "doctor" && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }

    const disallowed = ["userId", "isVerified", "rating", "totalRatings", "pendingReVerification"];
    disallowed.forEach(f => delete req.body[f]);

    // Validate required fields are still present after stripping
    const { fullName, phone, hospital, specialty, consultationFee, qualifications } = req.body;
    if (!fullName || !phone || !hospital || !specialty || !consultationFee) {
      return res.status(400).json({
        message: "fullName, phone, hospital, specialty, and consultationFee are required"
      });
    }
    if (!qualifications || qualifications.length === 0) {
      return res.status(400).json({ message: "At least one qualification is required" });
    }

    // Every profile update requires re-verification by admin
    req.body.isVerified = false;
    req.body.pendingReVerification = true;

    const updated = await Doctor.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Doctor profile not found" });

    res.status(200).json({
      message: "Profile updated. Your changes are pending admin re-verification.",
      doctor: updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors
// Patients browse: only verified, not pending re-verification, and available
const getAllDoctors = async (req, res) => {
  try {
    const { specialty, name, page = 1, limit = 10 } = req.query;
    const filter = { isVerified: true, pendingReVerification: false, isAvailable: true };
    if (specialty) filter.specialty = { $regex: specialty, $options: "i" };
    if (name)      filter.fullName  = { $regex: name, $options: "i" };

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Doctor.countDocuments(filter);
    const doctors = await Doctor.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-availability");

    res.status(200).json({ total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors/admin/all-doctors
// Admin sees every doctor with full details
const getAllDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).sort({ createdAt: -1 });
    res.status(200).json({ total: doctors.length, doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors/:userId/availability
const getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.params.userId })
      .select("availability fullName specialty");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json({ availability: doctor.availability });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/doctors/:userId/availability
// Availability changes do NOT require re-verification
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
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json({ message: "Availability updated successfully", availability: doctor.availability });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/doctors/:userId/verify
// Admin verifies (or re-verifies) a doctor
const verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.params.userId },
      { isVerified: true, pendingReVerification: false },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json({ message: "Doctor verified successfully", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors/admin/unverified
// Returns doctors that are either new (never verified) OR pending re-verification after a profile update
const getUnverifiedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      $or: [
        { isVerified: false },
        { pendingReVerification: true }
      ]
    }).sort({ updatedAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/doctors/prescriptions
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
    res.status(201).json({ message: "Prescription issued successfully", prescription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPrescriptionsByPatient = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.patientId })
      .sort({ createdAt: -1 });
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPrescriptionByAppointment = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ appointmentId: req.params.appointmentId });
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });
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
  getAllDoctorsAdmin,
  getDoctorAvailability,
  setDoctorAvailability,
  verifyDoctor,
  getUnverifiedDoctors,
  issuePrescription,
  getPrescriptionsByPatient,
  getPrescriptionByAppointment
};