const Patient = require("../models/Patient");

const createPatientProfile = async (req, res) => {
  try {
    const { userId, fullName, email, phone, dateOfBirth, gender, address, bloodGroup } = req.body;

    if (!userId || !fullName || !email) {
      return res.status(400).json({ message: "userId, fullName, and email are required" });
    }

    const existingPatient = await Patient.findOne({ userId });

    if (existingPatient) {
      return res.status(400).json({ message: "Patient profile already exists" });
    }

    const patient = await Patient.create({
      userId,
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      bloodGroup
    });

    res.status(201).json({
      message: "Patient profile created successfully",
      patient
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.params.userId });

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePatientProfile = async (req, res) => {
  try {
    const updatedPatient = await Patient.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    res.status(200).json({
      message: "Patient profile updated successfully",
      patient: updatedPatient
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPatientProfile,
  getPatientProfile,
  updatePatientProfile
};