const express = require("express");
const {
  registerUser,
  verifyOTP,
  loginUser,
  getProfile,
  changeUserRole
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);

router.get("/profile", protect, getProfile);

router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

router.get("/doctor", protect, authorize("doctor"), (req, res) => {
  res.json({ message: "Welcome Doctor" });
});

router.patch("/users/:id/role", protect, authorize("admin"), changeUserRole);

module.exports = router;