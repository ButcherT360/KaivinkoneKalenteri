import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./Navbar";
import Home from "./Home";
import CalendarPage from "./CalendarPage";
import AdminPage from "./AdminPage";
import Contact from "./Contact";
import Machines from "./Machines";
import Footer from "./Footer";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* redirect root → home */}
        <Route path="/" element={<Navigate to="/koti" />} />

        {/* sivut */}
        <Route path="/koti" element={<Home />} />
        <Route path="/kalenteri" element={<CalendarPage />} />
        <Route path="/yhteystiedot" element={<Contact />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/koneet" element={<Machines />} />

        {/* fallback */}
        <Route path="*" element={<h2>404 - Sivua ei löydy</h2>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;