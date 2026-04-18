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

// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const role = "patient";
//
//     if (!name || !email || !password) {
//   return res.status(400).json({ message: "Name, email, and password are required" });
//   }
//
//     const existingUser = await User.findOne({ email });
//
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }
//
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = generateOTP();
//
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       isVerified: false,
//       otp,
//       otpExpires: new Date(Date.now() + 10 * 60 * 1000)
//     });
//
//     await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/send-email`, {
//       to: email,
//       subject: "Verify Your Account",
//       message: `Hello ${name}, your OTP for account verification is ${otp}. It will expire in 10 minutes.`
//     });
//
//     res.status(201).json({
//       message: "User registered successfully. OTP sent to email.",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         isVerified: user.isVerified
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // const role = "patient";

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required" });
    }

    if (role !== "patient" && role !== "doctor") {
      return res.status(400).json({ message: "Role must be patient or doctor" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true  // skip verification
    });

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.status(200).json({
      message: "Account verified successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your account first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    await user.save();

    res.status(200).json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  registerUser,
  verifyOTP,
  loginUser,
  getProfile,
  changeUserRole
};