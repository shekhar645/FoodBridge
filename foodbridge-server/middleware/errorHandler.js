// ─── Global error handler ─────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // MySQL duplicate entry
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists.",
    });
  }

  // Validation errors from express-validator
  if (err.type === "validation") {
    return res.status(422).json({
      success: false,
      message: "Validation failed.",
      errors: err.errors,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// ─── 404 handler ──────────────────────────────────────────────
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
  });
};

module.exports = { errorHandler, notFound };
