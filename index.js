require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");
const path = require("path");

const app = express();

// =======================
//  MIDDLEWARE (TÄRKEÄ JÄRJESTYS)
// =======================
app.use(cors({ origin: "*" }));
app.use(express.json());


// =======================
//  STATIC FRONTEND (OPTIONAL)
// =======================
app.use(express.static(path.join(__dirname, "build")));


// =======================
//  DATABASE
// =======================
const db = new Database("bookings.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    deleteCode TEXT NOT NULL
  )
`).run();


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
//  ADMIN CHECK
// =======================
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).json({ error: "No token" });

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
}


// =======================
//  GET BOOKINGS
// =======================
app.get("/bookings", (req, res) => {
  const rows = db.prepare("SELECT * FROM bookings").all();
  res.json(rows);
});


// =======================
//  CREATE BOOKING
// =======================
app.post("/bookings", (req, res) => {
  const { date, name, deleteCode } = req.body;

  if (!date || !name || !deleteCode) {
    return res.status(400).json({ error: "Missing data" });
  }

  const exists = db.prepare("SELECT * FROM bookings WHERE date = ?").get(date);

  if (exists) {
    return res.status(400).json({ error: "Päivä on jo varattu" });
  }

  const stmt = db.prepare(
    "INSERT INTO bookings (date, name, deleteCode) VALUES (?, ?, ?)"
  );

  const result = stmt.run(date, name, deleteCode);

  res.json({
    id: result.lastInsertRowid,
    date,
    name
  });
});


// =======================
//  DELETE BOOKING
// =======================
app.delete("/bookings/:id", (req, res) => {
  const code = req.body?.code;
  const auth = req.headers.authorization;

  const isAdmin = auth && auth.startsWith("Bearer ");

  const row = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);

  if (!row) {
    return res.status(404).json({ error: "Not found" });
  }

  // ADMIN OHITUS
  if (!isAdmin) {
    if (!code) {
      return res.status(400).json({ error: "Missing code" });
    }

    if (row.deleteCode !== code) {
      return res.status(403).json({ error: "Wrong code" });
    }
  }

  db.prepare("DELETE FROM bookings WHERE id = ?").run(req.params.id);

  res.json({
    success: true,
    deletedId: req.params.id
  });
});


// =======================
//  FALLBACK (FIXED - EI '*' ROUTEA)
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