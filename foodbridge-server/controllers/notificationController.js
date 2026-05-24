const db = require("../db/connection");

// GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      [req.user.id]
    );
    const [[{ unread }]] = await db.query(
      "SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [req.user.id]
    );
    res.json({ success: true, data: rows, unread });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/read-all
exports.markAllRead = async (req, res, next) => {
  try {
    await db.query("UPDATE notifications SET is_read = TRUE WHERE user_id = ?", [req.user.id]);
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read
exports.markRead = async (req, res, next) => {
  try {
    await db.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
