const pool = require("./db/connection");

async function expireDonations() {
  try {
    const [result] = await pool.query(
      `UPDATE donations
       SET status = 'expired'
       WHERE status = 'available'
         AND best_before < NOW()`
    );
    if (result.affectedRows > 0) {
      console.log(`⏰ Cron: Expired ${result.affectedRows} donation(s)`);
    }
  } catch (err) {
    console.error("Cron error:", err.message);
  }
}

function startCron() {
  expireDonations();
  setInterval(expireDonations, 5 * 60 * 1000);
  console.log("⏰ Cron job started — checking for expired donations every 5 minutes");
}

module.exports = { startCron };