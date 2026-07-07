import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./Home";
import CalendarPage from "./CalendarPage";
import AdminPage from "./AdminPage";
import Contact from "./Contact";
import Machines from "./Machines";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ohjaa etusivulle */}
        <Route path="/" element={<Navigate to="/koti" />} />

        {/* Sivut */}
        <Route path="/koti" element={<Home />} />
        <Route path="/kalenteri" element={<CalendarPage />} />
        <Route path="/yhteystiedot" element={<Contact />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/koneet" element={<Machines />} />

        {/* Virhesivu */}
        <Route path="*" element={<h2>404 - Sivua ei löydy</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;