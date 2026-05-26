import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2>Kaivinkone</h2>

      <div className="links">
        <Link to="/koti">Etusivu</Link>
        <Link to="/kalenteri">Kalenteri</Link>
        <Link to="/koneet">Koneet</Link>
        <Link to="/yhteystiedot">Yhteystiedot</Link>
      </div>
    </nav>
  );
}