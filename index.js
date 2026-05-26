require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();

// =======================
//  POSTGRES
// =======================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// =======================
//  MIDDLEWARE
// =======================
app.use(cors({ origin: "*" }));
app.use(express.json());

// =======================
//  STATIC
// =======================
app.use(express.static(path.join(__dirname, "build")));

// =======================
//  HELPERS
// =======================
function getIP(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    ""
  );
}

const rateMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const limit = 1;

  const user = rateMap.get(ip) || [];
  const recent = user.filter(t => now - t < windowMs);

  if (recent.length >= limit) {
    return true;
  }

  recent.push(now);
  rateMap.set(ip, recent);

  return false;
}

// =======================
//  ADMIN LOGIN
// =======================
app.post("/admin/login", (req, res) => {
  const { password } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Wrong password" });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

// =======================
//  GET BOOKINGS
// =======================
app.get("/bookings", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bookings ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});

// =======================
//  CREATE BOOKING
// =======================
app.post("/bookings", async (req, res) => {
  try {
    const { date, name, deleteCode, deviceId } = req.body;

    if (!date || !name || !deleteCode || !deviceId) {
      return res.status(400).json({
        error: "Missing data"
      });
    }

    const ip = getIP(req);

    // RATE LIMIT
    if (isRateLimited(ip)) {
      return res.status(429).json({
        error: "Liikaa varauksia lyhyessä ajassa"
      });
    }

    // DEVICE CHECK
    const deviceExists = await pool.query(
      "SELECT * FROM bookings WHERE deviceId = $1 AND date = $2",
      [deviceId, date]
    );

    if (deviceExists.rows.length > 0) {
      return res.status(400).json({
        error: "Olet jo varannut tämän päivän"
      });
    }

    // IP CHECK
    const ipExists = await pool.query(
      "SELECT * FROM bookings WHERE ip = $1 AND date = $2",
      [ip, date]
    );

    if (ipExists.rows.length > 0) {
      return res.status(400).json({
        error: "Olet jo varannut tämän päivän"
      });
    }

    // DAY CHECK
    const exists = await pool.query(
      "SELECT * FROM bookings WHERE date = $1",
      [date]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({
        error: "Päivä on jo varattu"
      });
    }

    // INSERT
    const result = await pool.query(
      `
      INSERT INTO bookings
      (date, name, deleteCode, ip, deviceId)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [date, name, deleteCode, ip, deviceId]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =======================
//  DELETE BOOKING
// =======================
app.delete("/bookings/:id", async (req, res) => {
  try {
    const code = req.body?.code;
    const auth = req.headers.authorization;

    const isAdmin =
      auth && auth.startsWith("Bearer ");

    const result = await pool.query(
      "SELECT * FROM bookings WHERE id = $1",
      [req.params.id]
    );

    const row = result.rows[0];

    if (!row) {
      return res.status(404).json({
        error: "Not found"
      });
    }

    // USER CHECK
    if (!isAdmin) {
      if (!code) {
        return res.status(400).json({
          error: "Missing code"
        });
      }

      if (row.deletecode !== code) {
        return res.status(403).json({
          error: "Wrong code"
        });
      }
    }

    await pool.query(
      "DELETE FROM bookings WHERE id = $1",
      [req.params.id]
    );

    res.json({
      success: true,
      deletedId: req.params.id
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server error"
    });
  }
});

// =======================
//  404
// =======================
app.use((req, res) => {
  res.status(404).json({
    error: "Not found"
  });
});

// =======================
//  START
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});