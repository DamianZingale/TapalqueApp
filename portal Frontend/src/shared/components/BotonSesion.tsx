import type React from "react";
import { Link } from "react-router-dom";
import type { IBotonSesion } from "../types/PropsNavbar";
import { Nav } from "react-bootstrap";


export const BotonSesion: React.FC<IBotonSesion> = ({ isLoggedIn, onLogout }) => {

    return (
        <>
            {!isLoggedIn ? (
                <Nav.Link as={Link} to="/login" className="text-decoration-underline ms-auto">Iniciar sesión</Nav.Link>
            ) : (
                <>
                    <Nav.Link as={Link} to="/perfil" className="ms-auto">Mi perfil</Nav.Link>
                    <Nav.Link  onClick={onLogout} className="text-decoration-underline ms-auto" >Cerrar sesión</Nav.Link>
                </>
            )}
        </>
    );
}
