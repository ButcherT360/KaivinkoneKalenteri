// =======================
//  SIMPLE MEMORY RATE LIMIT
// =======================
const rateMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 min
  const limit = 1; // 1 varaus / 10 min

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
//  IMPROVED IP
// =======================
function getIP(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    ""
  );
}

// =======================
//  CREATE BOOKING (ANTI-SPAM VERSION)
// =======================
app.post("/bookings", (req, res) => {
  const { date, name, deleteCode } = req.body;

  if (!date || !name || !deleteCode) {
    return res.status(400).json({ error: "Missing data" });
  }

  const ip = getIP(req);
  const userAgent = req.headers["user-agent"] || "";

  // 🔥 1. RATE LIMIT
  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: "Liikaa varauksia lyhyessä ajassa"
    });
  }

  // 🔥 2. IP + DAY CHECK
  const ipDayExists = db.prepare(
    "SELECT * FROM bookings WHERE ip = ? AND date = ?"
  ).get(ip, date);

  if (ipDayExists) {
    return res.status(400).json({
      error: "Olet jo varannut tämän päivän"
    });
  }

  // 🔥 3. GLOBAL DAY CHECK
  const exists = db.prepare(
    "SELECT * FROM bookings WHERE date = ?"
  ).get(date);

  if (exists) {
    return res.status(400).json({
      error: "Päivä on jo varattu"
    });
  }

  // 🔥 4. INSERT (fingerprint mukana)
  const stmt = db.prepare(`
    INSERT INTO bookings (date, name, deleteCode, ip)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(date, name, deleteCode, ip);

  res.json({
    id: result.lastInsertRowid,
    date,
    name
  });
});