import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./Navbar";
import Home from "./Home";
import CalendarPage from "./CalendarPage";
import AdminPage from "./AdminPage";
import Contact from "./Contact";
import Machines from "./Machines";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* redirect root → kalenteri */}
        <Route path="/" element={<Navigate to="/kalenteri" />} />

        {/* sivut */}
        <Route path="/home" element={<Home />} />
        <Route path="/kalenteri" element={<CalendarPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/machines" element={<Machines />} />

        {/* fallback */}
        <Route path="*" element={<h2>404 - Sivua ei löydy</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;