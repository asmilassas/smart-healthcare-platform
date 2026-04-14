const Patient = require("../models/Patient");
const Report = require("../models/Report");

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

const createPatientReport = async (req, res) => {
  try {
    const { title, description, reportType, reportDate, doctorName, hospitalName, fileUrl } = req.body;
    const { userId } = req.params;

    if (!title || !reportDate) {
      return res.status(400).json({ message: "title and reportDate are required" });
    }

    const patient = await Patient.findOne({ userId });

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const report = await Report.create({
      userId,
      title,
      description,
      reportType,
      reportDate,
      doctorName,
      hospitalName,
      fileUrl
    });

    res.status(201).json({
      message: "Medical report added successfully",
      report
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatientReports = async (req, res) => {
  try {
    const { userId } = req.params;

    const reports = await Report.find({ userId }).sort({ reportDate: -1, createdAt: -1 });

    res.status(200).json({
      message: "Medical reports fetched successfully",
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePatientReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Medical report not found" });
    }

    await Report.findByIdAndDelete(reportId);

    res.status(200).json({
      message: "Medical report deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPatientProfile,
  getPatientProfile,
  updatePatientProfile,
  createPatientReport,
  getPatientReports,
  deletePatientReport
};