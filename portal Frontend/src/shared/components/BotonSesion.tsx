import type React from "react";
import { Link } from "react-router-dom";
import type { IBotonSesion } from "../types/PropsNavbar";
import { Nav } from "react-bootstrap";
import "../components/styles/navBar.css"

export const BotonSesion: React.FC<IBotonSesion> = ({ isLoggedIn, onLogout }) => {
    return (
        <>
            {!isLoggedIn ? (
                <Nav.Link as={Link} to="/login">Iniciar sesión</Nav.Link>
            ) : (
                <>
                    <Nav.Link as={Link} to="/perfil" className="navbar-session">Mi perfil</Nav.Link>
                    <Nav.Link onClick={onLogout} className="navbar-session">Cerrar sesión</Nav.Link>
                </>
            )}
        </>
    );
}