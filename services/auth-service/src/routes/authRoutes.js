const express = require("express");
const {
  registerUser,
  verifyOTP,
  loginUser,
  getProfile,
  changeUserRole,
  approveDoctor,
  rejectDoctor,
  getPendingDoctors,
  getAllUsers
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

router.get("/users", protect, authorize("admin"), getAllUsers);
router.patch("/users/:id/role", protect, authorize("admin"), changeUserRole);

router.get("/doctors/pending", protect, authorize("admin"), getPendingDoctors);
router.patch("/doctors/:id/approve", protect, authorize("admin"), approveDoctor);
router.patch("/doctors/:id/reject", protect, authorize("admin"), rejectDoctor);

module.exports = router;