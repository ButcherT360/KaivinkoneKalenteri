import { Link } from "react-router-dom";
export default function Home() {
    return (
        <div>
            <h1 className="title-bar">Etusivu</h1>
            <div className="container">
                <img src="/logo.png" alt="kaivurilogo" />
            </div>
            <div className="contact-center">
                <Link to="/yhteystiedot" className="contact-btn">
                    Ota yhteyttä
                </Link>
            </div>
        </div>
    );
}