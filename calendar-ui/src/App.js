import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CalendarPage from "./CalendarPage";
import AdminPage from "./AdminPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/*  oletusreitti */}
        <Route path="/" element={<Navigate to="/kalenteri" />} />

        {/*  kalenteri */}
        <Route path="/kalenteri" element={<CalendarPage />} />

        {/*  admin */}
        <Route path="/admin" element={<AdminPage />} />

        {/*  fallback */}
        <Route path="*" element={<h2>404 - Sivua ei löydy</h2>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;