import type React from "react";
import { Link } from "react-router-dom";
import type { IBotonSesion } from "../types/PropsNavbar";

import styles from "../components/styles/navBar.module.css";

export const BotonSesion: React.FC<IBotonSesion> = ({ isLoggedIn, onLogout }) => {
    return (
        <>
        {!isLoggedIn ? (
            <Link to="/login" className={styles.navbarSessionButton}>Iniciar sesión</Link>
        ) : (
            <>
            <Link to="/perfil" className={styles.navbarSession}>Mi perfil</Link>
            <button onClick={onLogout} className={styles.navbarSessionButton}>Cerrar sesión</button>
            </>
        )}
        </>
    );
};
