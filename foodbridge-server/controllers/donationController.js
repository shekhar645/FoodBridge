const { validationResult } = require("express-validator");
const db = require("../db/connection");

// ─── LIST DONATIONS ───────────────────────────────────────────
// GET /api/donations
// Query params: city, food_type, status, page, limit
exports.getDonations = async (req, res, next) => {
  try {
    const { city, food_type, status = "available", page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = ["d.best_before > NOW()"];
    const params = [];

    if (status)    { where.push("d.status = ?");     params.push(status); }
    if (city)      { where.push("d.city LIKE ?");    params.push(`%${city}%`); }
    if (food_type) { where.push("d.food_type = ?");  params.push(food_type); }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [donations] = await db.query(
      `SELECT
         d.*,
         u.name AS restaurant_name,
         u.org_name,
         u.phone AS restaurant_phone,
         u.city  AS restaurant_city
       FROM donations d
       JOIN users u ON u.id = d.restaurant_id
       ${whereClause}
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM donations d ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: donations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET SINGLE DONATION ──────────────────────────────────────
// GET /api/donations/:id
exports.getDonation = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT
         d.*,
         u.name AS restaurant_name,
         u.org_name,
         u.phone AS restaurant_phone,
         u.address AS restaurant_address,
         u.city AS restaurant_city
       FROM donations d
       JOIN users u ON u.id = d.restaurant_id
       WHERE d.id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Donation not found." });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── CREATE DONATION ──────────────────────────────────────────
// POST /api/donations  (restaurant only)
exports.createDonation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { title, description, food_type, quantity, serves, pickup_address, city, pincode, best_before, image_url } = req.body;

    const [result] = await db.query(
      `INSERT INTO donations
         (restaurant_id, title, description, food_type, quantity, serves, pickup_address, city, pincode, best_before, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, description, food_type, quantity, serves || null, pickup_address, city, pincode || null, best_before, image_url || null]
    );

    const [rows] = await db.query("SELECT * FROM donations WHERE id = ?", [result.insertId]);

    res.status(201).json({ success: true, message: "Donation listed successfully.", data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE DONATION ──────────────────────────────────────────
// PATCH /api/donations/:id  (restaurant only, own donations)
exports.updateDonation = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM donations WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Donation not found." });

    const donation = rows[0];
    if (donation.restaurant_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only edit your own donations." });
    }
    if (donation.status !== "available") {
      return res.status(400).json({ success: false, message: "Cannot edit a donation that has already been claimed." });
    }

    const { title, description, food_type, quantity, serves, pickup_address, city, pincode, best_before, image_url } = req.body;

    await db.query(
      `UPDATE donations SET title=?, description=?, food_type=?, quantity=?, serves=?,
       pickup_address=?, city=?, pincode=?, best_before=?, image_url=? WHERE id=?`,
      [title, description, food_type, quantity, serves, pickup_address, city, pincode, best_before, image_url, req.params.id]
    );

    const [updated] = await db.query("SELECT * FROM donations WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    next(err);
  }
};

// ─── CANCEL DONATION ──────────────────────────────────────────
// DELETE /api/donations/:id  (restaurant only)
exports.cancelDonation = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM donations WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Donation not found." });

    if (rows[0].restaurant_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only cancel your own donations." });
    }

    await db.query("UPDATE donations SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Donation cancelled." });
  } catch (err) {
    next(err);
  }
};

// ─── CLAIM DONATION ───────────────────────────────────────────
// PATCH /api/donations/:id/claim  (ngo only)
exports.claimDonation = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM donations WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Donation not found." });

    const donation = rows[0];
    if (donation.status !== "available") {
      return res.status(400).json({ success: false, message: "This donation is no longer available." });
    }

    // Create claim record
    await db.query(
      "INSERT INTO claims (donation_id, ngo_id, notes) VALUES (?, ?, ?)",
      [donation.id, req.user.id, req.body.notes || null]
    );

    // Update donation status
    await db.query(
      "UPDATE donations SET status = 'claimed', claimed_by = ?, claimed_at = NOW() WHERE id = ?",
      [req.user.id, donation.id]
    );

    // Notify restaurant
    await db.query(
      "INSERT INTO notifications (user_id, title, message, type, ref_id) VALUES (?, ?, ?, 'donation_claimed', ?)",
      [
        donation.restaurant_id,
        "Your donation was claimed!",
        `${req.user.org_name || req.user.name} has claimed your donation: "${donation.title}".`,
        donation.id,
      ]
    );

    res.json({ success: true, message: "Donation claimed successfully." });
  } catch (err) {
    next(err);
  }
};

// ─── MARK PICKED UP ───────────────────────────────────────────
// PATCH /api/donations/:id/pickup  (restaurant or ngo)
exports.markPickedUp = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM donations WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Donation not found." });

    const donation = rows[0];
    const isRestaurant = req.user.id === donation.restaurant_id;
    const isClaimingNGO = req.user.id === donation.claimed_by;

    if (!isRestaurant && !isClaimingNGO) {
      return res.status(403).json({ success: false, message: "Not authorized to update this donation." });
    }

    await db.query(
      "UPDATE donations SET status = 'picked_up', picked_up_at = NOW() WHERE id = ?",
      [donation.id]
    );
    await db.query(
      "UPDATE claims SET status = 'picked_up' WHERE donation_id = ? AND ngo_id = ?",
      [donation.id, donation.claimed_by]
    );

    res.json({ success: true, message: "Pickup confirmed! Great work." });
  } catch (err) {
    next(err);
  }
};

// ─── MY DONATIONS (restaurant) ────────────────────────────────
// GET /api/donations/my
exports.myDonations = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, u.name AS claimed_by_name, u.org_name AS claimed_by_org
       FROM donations d
       LEFT JOIN users u ON u.id = d.claimed_by
       WHERE d.restaurant_id = ?
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// ─── MY CLAIMS (ngo) ──────────────────────────────────────────
// GET /api/donations/claimed
exports.myClaims = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, c.claimed_at, c.status AS claim_status, u.name AS restaurant_name, u.org_name, u.phone AS restaurant_phone
       FROM claims c
       JOIN donations d ON d.id = c.donation_id
       JOIN users u ON u.id = d.restaurant_id
       WHERE c.ngo_id = ?
       ORDER BY c.claimed_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// ─── DASHBOARD STATS ──────────────────────────────────────────
// GET /api/donations/stats
exports.getStats = async (req, res, next) => {
  try {
    const [global] = await db.query("SELECT * FROM impact_stats");

    let personal = {};

    if (req.user.role === "restaurant") {
      const [[stats]] = await db.query(
        `SELECT
           COUNT(*) AS total_listed,
           SUM(status = 'picked_up') AS total_completed,
           SUM(status = 'available') AS total_active,
           COALESCE(SUM(CASE WHEN status = 'picked_up' THEN serves END), 0) AS meals_donated
         FROM donations WHERE restaurant_id = ?`,
        [req.user.id]
      );
      personal = stats;
    }

    if (req.user.role === "ngo") {
      const [[stats]] = await db.query(
        `SELECT
           COUNT(*) AS total_claimed,
           SUM(c.status = 'picked_up') AS total_collected,
           COALESCE(SUM(CASE WHEN c.status = 'picked_up' THEN d.serves END), 0) AS meals_collected
         FROM claims c
         JOIN donations d ON d.id = c.donation_id
         WHERE c.ngo_id = ?`,
        [req.user.id]
      );
      personal = stats;
    }

    res.json({ success: true, data: { global: global[0], personal } });
  } catch (err) {
    next(err);
  }
};
