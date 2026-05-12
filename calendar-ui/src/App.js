import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./App.css";

function App() {
  const [events, setEvents] = useState([]);

  // 🔹 hae varaukset backendistä
  useEffect(() => {
    fetch("http://localhost:3000/bookings")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(b => ({
          id: b.id,
          title: b.name,
          date: b.date,
          color: "red"
        }));

        setEvents(formatted);
      })
      .catch(err => console.log("FETCH ERROR:", err));
  }, []);

  // 🔹 lisää varaus
  function handleDateClick(info) {
    const name = prompt("Nimi:");
    if (!name) return;

    const deleteCode = prompt("Aseta poistokoodi (muista tämä!)");
    if (!deleteCode) return;

    const date = info.dateStr;

    const exists = events.some(e => e.date === date);

    if (exists) {
      alert("Tämä päivä on jo varattu!");
      return;
    }

    fetch("http://localhost:3000/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ date, name, deleteCode })
    })
      .then(res => res.json())
      .then(saved => {
        setEvents(prev => [
          ...prev,
          {
            id: saved.id,
            title: name,
            date,
            color: "red"
          }
        ]);
      })
      .catch(err => console.log(err));
  }

  // 🔥 POISTO KORJATTU
  function handleEventClick(info) {
    const code = prompt("Anna poistokoodi:");
    if (!code) return;

    const id = info.event.id;

    fetch(`http://localhost:3000/bookings/${id}?code=${code}`, {
      method: "DELETE"
    })
      .then(async res => {
        const data = await res.json();

        if (!res.ok) {
          alert(data.error);
          return;
        }

        setEvents(prev =>
          prev.filter(e => e.id !== id)

        );
        loadBookings();
      })
      .catch(err => console.log(err));
  }


  function loadBookings() {
    fetch("http://localhost:3000/bookings")
      .then(res => res.json())
      .then(data => {
        setEvents(
          data.map(b => ({
            id: b.id,
            title: b.name,
            date: b.date,
            color: "red"
          }))
        );
      });
  }
  useEffect(() => {
    loadBookings();
  }, []);
  return (
    <div style={{ padding: 20 }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />
    </div>
  );
}

export default App;