import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2>Kaivinkone</h2>

      <div className="links">
        <Link to="/">Etusivu</Link>
        <Link to="/machines">Koneet</Link>
        <Link to="/calendar">Kalenteri</Link>
        <Link to="/contact">Yhteystiedot</Link>
      </div>
    </nav>
  );
}