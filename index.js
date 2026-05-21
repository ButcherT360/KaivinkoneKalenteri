require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");
const path = require("path");

const app = express();

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
//  DB
// =======================
const db = new Database("bookings.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    deleteCode TEXT NOT NULL,
    ip TEXT,
    deviceId TEXT
  )
`).run();

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

  if (recent.length >= limit) return true;

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
app.get("/bookings", (req, res) => {
  const rows = db.prepare("SELECT * FROM bookings").all();
  res.json(rows);
});

// =======================
//  CREATE BOOKING (FINAL CLEAN)
// =======================
app.post("/bookings", (req, res) => {
  const { date, name, deleteCode, deviceId } = req.body;

  if (!date || !name || !deleteCode || !deviceId) {
    return res.status(400).json({ error: "Missing data" });
  }

  const ip = getIP(req);

  // rate limit
  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: "Liikaa varauksia lyhyessä ajassa"
    });
  }

  // device check
  const deviceExists = db.prepare(
    "SELECT * FROM bookings WHERE deviceId = ? AND date = ?"
  ).get(deviceId, date);

  if (deviceExists) {
    return res.status(400).json({
      error: "Olet jo varannut tämän päivän"
    });
  }

  // ip check
  const ipExists = db.prepare(
    "SELECT * FROM bookings WHERE ip = ? AND date = ?"
  ).get(ip, date);

  if (ipExists) {
    return res.status(400).json({
      error: "Olet jo varannut tämän päivän"
    });
  }

  // day check
  const exists = db.prepare(
    "SELECT * FROM bookings WHERE date = ?"
  ).get(date);

  if (exists) {
    return res.status(400).json({
      error: "Päivä on jo varattu"
    });
  }

  const stmt = db.prepare(`
    INSERT INTO bookings (date, name, deleteCode, ip, deviceId)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(date, name, deleteCode, ip, deviceId);

  res.json({
    id: result.lastInsertRowid,
    date,
    name
  });
});

// =======================
//  DELETE
// =======================
app.delete("/bookings/:id", (req, res) => {
  const code = req.body?.code;
  const auth = req.headers.authorization;

  const isAdmin = auth && auth.startsWith("Bearer ");

  const row = db.prepare(
    "SELECT * FROM bookings WHERE id = ?"
  ).get(req.params.id);

  if (!row) {
    return res.status(404).json({ error: "Not found" });
  }

  if (!isAdmin) {
    if (!code) return res.status(400).json({ error: "Missing code" });

    if (row.deleteCode !== code) {
      return res.status(403).json({ error: "Wrong code" });
    }
  }

  db.prepare("DELETE FROM bookings WHERE id = ?").run(req.params.id);

  res.json({ success: true, deletedId: req.params.id });
});

// =======================
//  404
// =======================
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// =======================
//  START
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});