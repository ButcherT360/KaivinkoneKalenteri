import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <body>
      <nav className="navbar">
        <h2>Kaivinkone vuokraus</h2>

        <div className="links">
          <Link to="/koti">Etusivu</Link>
          <Link to="/kalenteri">Kalenteri</Link>
          <Link to="/koneet">Koneet</Link>
          <Link to="/yhteystiedot">Yhteystiedot</Link>
        </div>
      </nav>
    </body>
  );
}