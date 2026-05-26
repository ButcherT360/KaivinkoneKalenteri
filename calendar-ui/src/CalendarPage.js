import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import fiLocale from "@fullcalendar/core/locales/fi";
import "./App.css";

// 🌐 API URL (Vercel + Render)
const API = process.env.REACT_APP_API_URL || "https://kaivinkonekalenteri.onrender.com";

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [name, setName] = useState("");
  const [deleteCode, setDeleteCode] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteInput, setDeleteInput] = useState("");

  // DEVICE ID (SAFE VERSION)
  const [deviceId] = useState(() => {
    const saved = localStorage.getItem("deviceId");

    if (saved) return saved;

    const id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);

    return id;
  });

  localStorage.setItem("deviceId", deviceId);
  // ======================
  //  HAE VARAUKSET
  // ======================
  const loadBookings = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API}/bookings`);
      const data = await res.json();

      setEvents(
        data.map((b) => ({
          id: b.id,
          title: b.name,
          start: b.date,
          backgroundColor: "#a855f7",
          borderColor: "#a855f7",
          textColor: "#ffffff",
          allDay: true
        }))
      );
    } catch (err) {
      console.log("LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // ======================
  //  DATE CLICK
  // ======================
  function handleDateClick(info) {
    const date = info.dateStr;

    const isBooked = events.some((e) => e.start === date);

    if (isBooked) {
      alert("Tämä päivä on jo varattu!");
      return;
    }

    setSelectedDate(date);
    setShowModal(true);
  }

  // ======================
  //  SAVE BOOKING
  // ======================
  async function saveBooking() {
    if (!name || !deleteCode) {
      alert("Täytä kaikki kentät");
      return;
    }

    try {
      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          name,
          deleteCode,
          deviceId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      await loadBookings();

      setShowModal(false);
      setName("");
      setDeleteCode("");
      setSelectedDate("");
    } catch (err) {
      console.log("SAVE ERROR:", err);
    }
  }

  // ======================
  //  DELETE
  // ======================
  async function confirmDelete() {
    if (!deleteTarget || !deleteInput) return;

    try {
      const res = await fetch(
        `${API}/bookings/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: deleteInput })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      await loadBookings();

      setDeleteTarget(null);
      setDeleteInput("");
    } catch (err) {
      console.log("DELETE ERROR:", err);
    }
  }

  return (
    <div style={{ padding: 20 }}>

      <h1>Kaivurin vuokrauskalenteri</h1>

      <div
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "flex-start"
        }}
      >

        {/* VASEN */}
        <div>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: "100%",
              maxWidth: "720px",
              height: "100%",
              maxHeight: "1080px",
              borderRadius: "10px"
            }}
          />
        </div>

        {/* OIKEA */}
        <div style={{ flex: 1 }}>

          {loading && <p>Ladataan varauksia...</p>}

          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={fiLocale}
            events={events}
            dateClick={handleDateClick}
            eventClick={(info) => setDeleteTarget(info.event)}
          />

          {/* VARAUSLISTA */}
          <h2>Varaukset</h2>

          {events.length === 0 ? (
            <p>Ei varauksia</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bookingItem">
                <strong>{event.start}</strong> – {event.title}

                <button onClick={() => setDeleteTarget(event)}>
                  Poista
                </button>
              </div>
            ))
          )}

          {/* CREATE MODAL */}
          {showModal && (
            <div className="modalOverlay">
              <div className="modal">
                <h2>Uusi varaus</h2>

                <p>Päivä: {selectedDate}</p>

                <input
                  placeholder="Nimi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Poistokoodi"
                  value={deleteCode}
                  onChange={(e) => setDeleteCode(e.target.value)}
                />

                <button onClick={saveBooking}>Tallenna</button>
                <button onClick={() => setShowModal(false)}>Peruuta</button>
              </div>
            </div>
          )}

          {/* DELETE MODAL */}
          {deleteTarget && (
            <div className="modalOverlay">
              <div className="modal">
                <h2>Poista varaus</h2>

                <p>{deleteTarget.title}</p>

                <input
                  type="password"
                  placeholder="Poistokoodi"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                />

                <button onClick={confirmDelete}>Poista</button>
                <button onClick={() => setDeleteTarget(null)}>
                  Peruuta
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;