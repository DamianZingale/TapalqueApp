import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BotonSesion } from "./BotonSesion";
import styles from "../components/styles/navBar.module.css";

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
        <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
            <div className={styles.containerLogos}>
            <img src="/LogoTpqGo.png" alt="Logo TapalquéGO" className={styles.navbarLogo} />
            <Link to="/" className={styles.navbarBrand} onClick={() => setExpanded(false)}>
                TapalquéGO!
            </Link>
            </div>

            <div className={styles.containerLinks}>
            <Link to="/termas" className={styles.navbarLink}>Termas</Link>
            <Link to="/gastronomia" className={styles.navbarLink}>Gastronomía</Link>
            <Link to="/hospedaje" className={styles.navbarLink}>Hospedajes</Link>
            <Link to="/comercio" className={styles.navbarLink}>Comercios</Link>
            <Link to="#" className={styles.navbarLink}>Eventos</Link>
            </div>

            <button
            className={styles.navbarToggle}
            onClick={() => setExpanded(!expanded)}
            aria-label="Toggle navigation"
            >
            ☰
            </button>

            <div className={styles.navbarSecion}>
            <BotonSesion isLoggedIn={isLoggedIn} onLogout={handleLogout} />
            </div>

            <div className={`${styles.navbarSlide} ${expanded ? styles.slideOpen : ""}`}>
            <button className={styles.slideClose} onClick={() => setExpanded(false)}>✕</button>
            <div className={styles.slideLinks}>
                <Link to="/termas" className={styles.slideLink} onClick={() => setExpanded(false)}>Termas</Link>
                <Link to="/gastronomia" className={styles.slideLink} onClick={() => setExpanded(false)}>Gastronomía</Link>
                <Link to="/hospedaje" className={styles.slideLink} onClick={() => setExpanded(false)}>Hospedajes</Link>
                <Link to="/comercio" className={styles.slideLink} onClick={() => setExpanded(false)}>Comercios</Link>
                <Link to="/#" className={styles.slideLink} onClick={() => setExpanded(false)}>Event</Link>
                <BotonSesion isLoggedIn={isLoggedIn} onLogout={handleLogout} />
            </div>
            </div>
        </div>
        </nav>
    );
}
