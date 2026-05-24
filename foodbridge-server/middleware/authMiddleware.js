const jwt  = require("jsonwebtoken");
const db   = require("../db/connection");

// ── Verify JWT and attach user to req ─────────────────────────
exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authenticated. Please log in." });
    }

    const token = header.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Token invalid or expired. Please log in again." });
    }

    const [[user]] = await db.query(
      "SELECT id, name, email, role, org_name, city, phone, is_active FROM users WHERE id = ?",
      [decoded.id]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: "Account not found or deactivated." });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// ── Role-based access control ─────────────────────────────────
exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. This route is for: ${roles.join(", ")}.`,
    });
  }
  next();
};