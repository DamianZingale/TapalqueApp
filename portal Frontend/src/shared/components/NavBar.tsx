import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BotonSesion } from "./BotonSesion";
import "../components/styles/navBar.css";

export default function NavBar() {
    const [expanded, setExpanded] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setExpanded(false);
    }, [location]);

    const handleLogout = () => {
        setIsLoggedIn(false);
        navigate("/");
    };

    return (
        <nav className="navbar">
        <div className="navbar-container">
            <div className="container-logos">
            <img src="/LogoTpqGo.png" alt="Logo TapalquéGO" className="navbar-logo" />
            <Link to="/" className="navbar-brand" onClick={() => setExpanded(false)}>
            TapalquéGO!
            </Link>
            </div>

            <div className="container-links">
            <Link to="/termas" className="navbar-link">Termas</Link>
            <Link to="/gastronomia" className="navbar-link">Gastronomía</Link>
            <Link to="/hospedaje" className="navbar-link">Hospedajes</Link>
            <Link to="/comercio" className="navbar-link">Comercios</Link>
            </div>

            <button
            className="navbar-toggle"
            onClick={() => setExpanded(!expanded)}
            aria-label="Toggle navigation"
            >
            ☰
            </button>
            <div className="navbar-secion">
                <BotonSesion isLoggedIn={isLoggedIn} onLogout={handleLogout} />
            </div>

            <div className={`navbar-slide ${expanded ? "slide-open" : ""}`}>
            <button className="slide-close" onClick={() => setExpanded(false)}>✕</button>
            <div className="slide-links">
                <Link to="/termas" className="slide-link" onClick={() => setExpanded(false)}>Termas</Link>
                <Link to="/gastronomia" className="slide-link" onClick={() => setExpanded(false)}>Gastronomía</Link>
                <Link to="/hospedaje" className="slide-link" onClick={() => setExpanded(false)}>Hospedajes</Link>
                <Link to="/comercio" className="slide-link" onClick={() => setExpanded(false)}>Comercios</Link>
                <BotonSesion isLoggedIn={isLoggedIn} onLogout={handleLogout} />
            </div>
            </div>
        </div>
        </nav>
    );
}