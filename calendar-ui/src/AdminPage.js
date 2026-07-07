import { useEffect, useState } from "react";
import AdminLogin from "./AdminLogin";

// 🌐 API URL
const API = process.env.REACT_APP_API_URL;

function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ======================
  //  LOGIN CHECK
  // ======================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // ======================
  //  HAE VARAUKSET
  // ======================
  const loadBookings = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API}/bookings`);
      const data = await res.json();

      setEvents(data);

    } catch (err) {
      console.log("LOAD ERROR:", err);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadBookings();
    }
  }, [isLoggedIn]);

  // ======================
  //  DELETE
  // ======================
  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      const res = await fetch(
        `${API}/bookings/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      await loadBookings();
      setDeleteTarget(null);

    } catch (err) {
      console.log("DELETE ERROR:", err);
    }
  }

  // ======================
  //  LOGIN VIEW
  // ======================
  if (!isLoggedIn) {
    return (
      <AdminLogin
        onLogin={() => {
          setIsLoggedIn(true);
        }}
      />
    );
  }

  // ======================
  //  ADMIN VIEW
  // ======================
  return (

    <div className="layout">

      <h1 className="title-bar">Admin - Varaukset</h1>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }}
      >
        Logout
      </button>

      {loading && <p>Ladataan...</p>}

      {!loading && events.length === 0 && (
        <p>Ei varauksia</p>
      )}

      {events.map((event) => (
        <div key={event.id} className="bookingItem">

          <strong>{event.date}</strong> – {event.name}

          <button onClick={() => setDeleteTarget(event)}>
            Poista
          </button>

        </div>
      ))}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="modalOverlay">

          <div className="modal">

            <h2>Poista varaus</h2>

            <p>
              {deleteTarget.date} – {deleteTarget.name}
            </p>

            <button onClick={confirmDelete}>
              Poista
            </button>

            <button onClick={() => setDeleteTarget(null)}>
              Peruuta
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;