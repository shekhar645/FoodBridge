const express = require("express");
const router  = express.Router();
const db      = require("../db/connection");
const { protect } = require("../middleware/authMiddleware");

// GET /api/notifications  — my notifications
router.get("/", protect, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/:id/read  — mark one as read
router.patch("/:id/read", protect, async (req, res, next) => {
  try {
    await db.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/read-all  — mark all as read
router.patch("/read-all", protect, async (req, res, next) => {
  try {
    await db.query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = ?",
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;