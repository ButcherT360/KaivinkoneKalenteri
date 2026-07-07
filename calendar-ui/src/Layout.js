import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ title, children }) {
    return (
        <>
            <h1 className="title-bar">{title}</h1>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}