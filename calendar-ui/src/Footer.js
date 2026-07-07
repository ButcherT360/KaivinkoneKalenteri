import { Link } from "react-router-dom";
export default function Footer() {
    return (
        <footer className="footer">
            <div className="contact-center">
                <Link to="/yhteystiedot" className="contact-btn">
                    Ota yhteyttä
                </Link>
            </div>
            <p>© 2026 Kaivinkonevuokraus</p>
            {/*<p>Puhelin: </p>
      <p>Sähköposti: </p>*/}
        </footer>
    );
}