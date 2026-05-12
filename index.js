const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// tietokanta
const db = new sqlite3.Database("bookings.db");

// luo taulu
db.run(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    name TEXT,
    deleteCode TEXT
  )
`);

// HAE KAIKKI
app.get("/bookings", (req, res) => {
  db.all("SELECT * FROM bookings", [], (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).json([]);
    }

    res.json(rows);
  });
});

// LISÄÄ VARAUS 
app.post("/bookings", (req, res) => {
  const { date, name, deleteCode } = req.body;

  if (!date || !name || !deleteCode) {
    return res.status(400).json({ error: "Missing data" });
  }

  db.get(
    "SELECT * FROM bookings WHERE date = ?",
    [date],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (row) {
        return res.status(400).json({ error: "Päivä on jo varattu" });
      }

      db.run(
        "INSERT INTO bookings (date, name, deleteCode) VALUES (?, ?, ?)",
        [date, name, deleteCode],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });

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

// DELETE 
app.delete("/bookings/:id", (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: "Missing code" });
  }

  db.get(
    "SELECT * FROM bookings WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!row) {
        return res.status(404).json({ error: "Not found" });
      }

      if (row.deleteCode !== code) {
        return res.status(403).json({ error: "Not allowed" });
      }

      db.run(
        "DELETE FROM bookings WHERE id = ?",
        [req.params.id],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });

          res.json({ success: true });
        }
      );
    }
  );
});

// START
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});