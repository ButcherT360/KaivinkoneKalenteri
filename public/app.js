app.use(express.json());
const calendar = document.getElementById("calendar");

// tee 30 päivää kalenteri (simppeli versio)
for (let i = 1; i <= 30; i++) {
  const div = document.createElement("div");
  div.className = "day";
  div.innerText = "2026-05-" + (i < 10 ? "0" + i : i);

  div.onclick = () => book(div.innerText);

  calendar.appendChild(div);
}

// hae varaukset
async function load() {
  const res = await fetch("/bookings");
  const data = await res.json();

  console.log(data);
}

load();

// varaa päivä
async function book(date) {
  const name = document.getElementById("name").value;

  if (!name) return alert("Kirjoita nimi");

  await fetch("/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ date, name })
  });

  alert("Varattu!");
  load();
}