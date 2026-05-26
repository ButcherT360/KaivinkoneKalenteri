import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";

import Navbar from "./Navbar";
import CalendarPage from "./CalendarPage";
import AdminPage from "./AdminPage";
import Contact from "./Contact";
import Machines from "./Machines";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>        
        <Route path="/" element={<Home />} />
        {/*  oletusreitti */}
        <Route path="/" element={<Navigate to="/kalenteri" />} />
        {/*  kalenteri */}
        <Route path="/kalenteri" element={<CalendarPage />} />
        <Route path="/contact" element={<Contact />} />
        {/*  admin */}
        <Route path="/admin" element={<AdminPage />} />
        {/*  fallback */}
        <Route path="*" element={<h2>404 - Sivua ei löydy</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;