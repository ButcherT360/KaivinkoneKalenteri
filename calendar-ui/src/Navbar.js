import { Link } from "react-router-dom";

<h1 className="title-bar">Kaivinkone vuokraus </h1>
export default function Navbar() {
  return (
      <nav className="navbar">
        

        <div className="links">
          <Link to="/koti">Etusivu</Link>
          <Link to="/kalenteri">Kalenteri</Link>
          <Link to="/koneet">Koneet</Link>
          <Link to="/yhteystiedot">Yhteystiedot</Link>
        </div>
      </nav>
  );
}