const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const db = require("../db/connection");

// ─── Validation rules ─────────────────────────────────────────
const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  body("phone").trim().notEmpty().withMessage("Phone number is required."),
  body("role").optional().isIn(["user", "restaurant", "ngo"]).withMessage("Invalid role."),
];

const loginRules = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
  body("password").notEmpty().withMessage("Password is required."),
];

// ─── Routes ───────────────────────────────────────────────────
router.post("/register", registerRules, register);
router.post("/login",    loginRules,    login);
router.post("/refresh",                refreshToken);
router.post("/logout",                 logout);

// Protected
router.get("/me",                protect, getMe);
router.patch("/me",              protect, updateProfile);
router.patch("/change-password", protect, changePassword);

// Profile update
router.patch("/profile", protect, async (req, res, next) => {
  try {
    const { name, phone, city, org_name } = req.body;
    await db.query(
      `UPDATE users SET name=?, phone=?, city=?, org_name=? WHERE id=?`,
      [name, phone, city, org_name || null, req.user.id]
    );
    const [rows] = await db.query(
      "SELECT id, name, email, role, phone, city, org_name FROM users WHERE id=?",
      [req.user.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;