import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./App.css";

function App() {
  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [name, setName] = useState("");
  const [deleteCode, setDeleteCode] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteInput, setDeleteInput] = useState("");

  // hae varaukset


  
  const loadBookings = async () => {
    //setLoading(true);
    //await new Promise(r => setTimeout(r, 1000)); // pakottaa 2s viive
    try {
      const res = await fetch("http://localhost:3000/bookings");
      const data = await res.json();

      setEvents(
        data.map(b => ({
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

  // päiväklikkaus
  function handleDateClick(info) {
    const date = info.dateStr;

    const isBooked = events.some(e => e.start === date);
    if (isBooked) {
      alert("Tämä päivä on jo varattu!");
      return;
    }

    setSelectedDate(date);
    setShowModal(true);
  }

  // tallenna varaus
  async function saveBooking() {
    if (!name || !deleteCode) {
      alert("Täytä kaikki kentät");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          name,
          deleteCode
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

  // avaa delete-modal
  function handleEventClick(info) {
    setDeleteTarget(info.event);
    setDeleteInput("");
  }

  // poisto
  async function confirmDelete() {
    if (!deleteTarget || !deleteInput) return;

    try {
      const res = await fetch(
        `http://localhost:3000/bookings/${deleteTarget.id}`,
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

    {loading && <p>Ladataan varauksia...</p>}

    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={events}
      dateClick={handleDateClick}
      eventClick={handleEventClick}

      dayCellClassNames={(arg) => {
        const year = arg.date.getFullYear();
        const month = String(arg.date.getMonth() + 1).padStart(2, "0");
        const day = String(arg.date.getDate()).padStart(2, "0");

        const date = `${year}-${month}-${day}`;

        const isBooked = events.some(e => e.start === date);

        return isBooked ? "booked" : "free" ;
        <div> 
          <div>{arg.dayNumberText}</div>

          {isBooked && (
            <div style={{ fontSize: "14px", color: "red" }}>
              VARATTU
            </div>
          )}
        </div>

        
      }}
      
      dayCellContent={(arg) => {
        const year = arg.date.getFullYear();
        const month = String(arg.date.getMonth() + 1).padStart(2, "0");
        const day = String(arg.date.getDate()).padStart(2, "0");

        const date = `${year}-${month}-${day}`;
        const booked = events.some(e => e.start === date);
        const isBooked = events.some(e => e.start === date);

        return (
          <div>
            <div>{arg.dayNumberText}</div>

            {isBooked && (
              <div style={{ fontSize: "14px", color: "red" }}>
                VARATTU
              </div>
            )}
          </div>
        );
      }}
      
    />
    <div>
    <h2>Varaukset</h2>

    {events.length === 0 ? (
      <p>Ei varauksia</p>
    ) : (
      events.map(event => (
        <div key={event.id} className="bookingItem">
          <strong>{event.start}</strong> – {event.title}

          <button onClick={() => setDeleteTarget(event)}>
            Poista
          </button>
        </div>
      ))
    )}</div>

      
      {/* CREATE MODAL */}
      {showModal && (
        <div className="modalOverlay">
          <div className="modal">
            <h2>Uusi varaus</h2>

            <p>Päivä: {selectedDate}</p>

            <input
              placeholder="Nimi"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <input
              type="password"
              placeholder="Poistokoodi"
              value={deleteCode}
              onChange={e => setDeleteCode(e.target.value)}
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
              onChange={e => setDeleteInput(e.target.value)}
            />

            <button onClick={confirmDelete}>Poista</button>
            <button onClick={() => setDeleteTarget(null)}>Peruuta</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;