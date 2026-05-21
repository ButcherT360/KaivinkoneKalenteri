require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use(cors({
  origin: "*"
}));
app.use(express.json());


// tietokanta
const db = new sqlite3.Database("bookings.db");

// taulu
db.run(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    deleteCode TEXT NOT NULL
  )
`);


// =======================
//  ADMIN LOGIN
// =======================
app.post("/admin/login", (req, res) => {
  const { password } = req.body;

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (password !== ADMIN_PASSWORD) {
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
//  ADMIN MIDDLEWARE
// =======================
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}


// =======================
//  GET ALL BOOKINGS
// =======================
app.get("/bookings", (req, res) => {
  db.all("SELECT * FROM bookings", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    res.json(rows);
  });
});


// =======================
//  CREATE BOOKING
// =======================
app.post("/bookings", (req, res) => {
  const { date, name, deleteCode } = req.body;

  if (!date || !name || !deleteCode) {
    return res.status(400).json({ error: "Missing data" });
  }

  db.get(
    "SELECT * FROM bookings WHERE date = ?",
    [date],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (row) {
        return res.status(400).json({ error: "Päivä on jo varattu" });
      }

      db.run(
        "INSERT INTO bookings (date, name, deleteCode) VALUES (?, ?, ?)",
        [date, name, deleteCode],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({
            id: this.lastID,
            date,
            name
          });
        }
      );
    }
  );
});


// =======================
//  DELETE BOOKING
// =======================
// ADMIN ohittaa koodin, USER tarvitsee deleteCode
app.delete("/bookings/:id", (req, res) => {
  const code = req.body?.code; // 👈 tärkeä (ei kaadu jos undefined)
  const auth = req.headers.authorization;

  const isAdmin = auth && auth.startsWith("Bearer ");

  db.get(
    "SELECT * FROM bookings WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Not found" });

      //  ADMIN OHITUS
      if (!isAdmin) {
        if (!code) {
          return res.status(400).json({ error: "Missing code" });
        }

        if (row.deleteCode !== code) {
          return res.status(403).json({ error: "Wrong code" });
        }
      }

      db.run(
        "DELETE FROM bookings WHERE id = ?",
        [req.params.id],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });

          res.json({
            success: true,
            deletedId: req.params.id
          });
        }
      );
    }
  );
});


// =======================
//  START SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});