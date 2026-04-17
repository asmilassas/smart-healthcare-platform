const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/User");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password, and role are required"
      });
    }

    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either patient or doctor"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const approvalStatus = role === "doctor" ? "pending" : "approved";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      approvalStatus,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000)
    });

    console.log("Calling URL:", `${process.env.NOTIFICATION_SERVICE_URL}/send-email`);

    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/send-email`, {
        to: email,
        subject: "Verify Your Account",
        message: `Hello ${name}, your OTP for account verification is ${otp}. It will expire in 10 minutes.`
      });
    } catch (error) {
      console.error("Email failed:", error.response?.data || error.message);
    }

    res.status(201).json({
      message:
        role === "doctor"
          ? "Doctor registered successfully. OTP sent to email. Account is pending admin approval."
          : "Patient registered successfully. OTP sent to email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Registration failed" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error("OTP verify error:", error.message);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify OTP first" });
    }

    if (user.role === "doctor" && user.approvalStatus === "pending") {
      return res.status(403).json({ message: "Doctor account is pending admin approval" });
    }

    if (user.role === "doctor" && user.approvalStatus === "rejected") {
      return res.status(403).json({ message: "Doctor account is rejected" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        approvalStatus: user.approvalStatus
      },
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed" });
  }
};

const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      message: "Profile fetched successfully",
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["patient", "doctor", "admin"];

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;

    if (role === "doctor") {
      user.approvalStatus = "approved";
    } else if (role === "patient" || role === "admin") {
      user.approvalStatus = "approved";
    }

    await user.save();

    res.status(200).json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (error) {
    console.error("Change role error:", error.message);
    res.status(500).json({ message: "Failed to update user role" });
  }
};

const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "doctor") {
      return res.status(400).json({ message: "This user is not a doctor" });
    }

    user.approvalStatus = "approved";
    await user.save();

    res.status(200).json({
      message: "Doctor approved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (error) {
    console.error("Approve doctor error:", error.message);
    res.status(500).json({ message: "Failed to approve doctor" });
  }
};

const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "doctor") {
      return res.status(400).json({ message: "This user is not a doctor" });
    }

    user.approvalStatus = "rejected";
    await user.save();

    res.status(200).json({
      message: "Doctor rejected successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (error) {
    console.error("Reject doctor error:", error.message);
    res.status(500).json({ message: "Failed to reject doctor" });
  }
};

const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: "doctor",
      approvalStatus: "pending",
      isVerified: true
    }).select("-password");

    console.log("Pending doctors found:", doctors);

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Get pending doctors error:", error.message);
    res.status(500).json({ message: "Failed to fetch pending doctors" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      message: "Users fetched successfully",
      users
    });
  } catch (error) {
    console.error("Get all users error:", error.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

module.exports = {
  registerUser,
  verifyOTP,
  loginUser,
  getProfile,
  changeUserRole,
  approveDoctor,
  rejectDoctor,
  getPendingDoctors,
  getAllUsers
};