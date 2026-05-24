const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const db = require("../db/connection");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../config/jwt");

// ─── Helper: send token response ─────────────────────────────
const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token in DB
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await db.query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [user.id, refreshToken, expiresAt]
  );

  const { password_hash, ...safeUser } = user;

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: safeUser,
  });
};

// ─── REGISTER ─────────────────────────────────────────────────
// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, phone, role, org_name } = req.body;

    // Check existing email
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash, phone, role, org_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, password_hash, phone, role || "user", org_name || null]
    );

    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
    await sendTokenResponse(rows[0], 201, res);
  } catch (err) {
    next(err);
  }
};

// ─── LOGIN ────────────────────────────────────────────────────
// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Fetch user
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "Account has been deactivated." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    await sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────
// POST /api/auth/refresh
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token required." });
    }

    // Verify token signature
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token." });
    }

    // Check DB
    const [tokens] = await db.query(
      "SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()",
      [refreshToken, decoded.id]
    );
    if (!tokens.length) {
      return res.status(401).json({ success: false, message: "Refresh token revoked or expired." });
    }

    // Rotate: delete old, issue new
    await db.query("DELETE FROM refresh_tokens WHERE token = ?", [refreshToken]);

    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [decoded.id]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    await sendTokenResponse(rows[0], 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────
// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db.query("DELETE FROM refresh_tokens WHERE token = ?", [refreshToken]);
    }
    res.json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
};

// ─── GET ME ───────────────────────────────────────────────────
// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, role, org_name, address, city, avatar_url, is_verified, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────
// PATCH /api/auth/me
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, org_name, address, city } = req.body;
    await db.query(
      "UPDATE users SET name=?, phone=?, org_name=?, address=?, city=? WHERE id=?",
      [name, phone, org_name, address, city, req.user.id]
    );
    const [rows] = await db.query(
      "SELECT id, name, email, phone, role, org_name, address, city, avatar_url, is_verified FROM users WHERE id = ?",
      [req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────
// PATCH /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const [rows] = await db.query("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [password_hash, req.user.id]);

    // Revoke all refresh tokens (force re-login everywhere)
    await db.query("DELETE FROM refresh_tokens WHERE user_id = ?", [req.user.id]);

    res.json({ success: true, message: "Password changed successfully. Please log in again." });
  } catch (err) {
    next(err);
  }
};
