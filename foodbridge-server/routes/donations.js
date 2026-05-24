const express  = require("express");
const { body } = require("express-validator");
const router   = express.Router();

const {
  getDonations,
  getDonation,
  createDonation,
  updateDonation,
  cancelDonation,
  claimDonation,
  markPickedUp,
  myDonations,
  myClaims,
  getStats,
} = require("../controllers/donationController");

const { protect, restrictTo } = require("../middleware/authMiddleware");

// ── Public routes ─────────────────────────────────────────────
router.get("/",            getDonations);
router.get("/my",          protect, restrictTo("restaurant"), myDonations);
router.get("/claimed",     protect, restrictTo("ngo"), myClaims);
router.get("/stats",       protect, getStats);

// ── Public stats (no auth needed) ────────────────────────────
router.get("/public-stats", async (req, res, next) => {
  try {
    const db = require("../db/connection");
    const [rows] = await db.query("SELECT * FROM impact_stats");
    res.json({ success: true, data: rows[0] || {} });
  } catch (err) { next(err); }
});

router.get("/:id",  getDonation);

// ── Restaurant routes ─────────────────────────────────────────
const donationValidation = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("food_type").isIn(["veg", "non-veg", "both"]).withMessage("food_type must be veg, non-veg, or both."),
  body("quantity").trim().notEmpty().withMessage("Quantity is required."),
  body("pickup_address").trim().notEmpty().withMessage("Pickup address is required."),
  body("city").trim().notEmpty().withMessage("City is required."),
  body("best_before").isISO8601().withMessage("best_before must be a valid date."),
];

router.post("/",
  protect,
  restrictTo("restaurant"),
  donationValidation,
  createDonation
);

router.patch("/:id",
  protect,
  restrictTo("restaurant"),
  updateDonation
);

router.delete("/:id",
  protect,
  restrictTo("restaurant"),
  cancelDonation
);

// ── NGO routes ────────────────────────────────────────────────
router.patch("/:id/claim",
  protect,
  restrictTo("ngo"),
  claimDonation
);

router.patch("/:id/pickup",
  protect,
  restrictTo("ngo", "restaurant"),
  markPickedUp
);

module.exports = router;