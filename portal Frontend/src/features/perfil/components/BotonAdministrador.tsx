import { useNavigate } from "react-router-dom";
import authService from "../../../services/authService";

// Roles: 1 = Moderador, 2 = Administrador, 3 = Usuario
const ROLES = {
    MODERADOR: 1,
    ADMINISTRADOR: 2,
    USUARIO: 3
};

export const BotonAdministrador = () => {
    const navigate = useNavigate();
    const rol = authService.getRolUsuario();

    // Si es usuario común, no mostrar el botón
    if (rol === ROLES.USUARIO || rol === null) {
        return null;
    }

    const handleClick = () => {
        switch (rol) {
            case ROLES.MODERADOR:
                navigate("/moderador");
                break;
            case ROLES.ADMINISTRADOR:
                navigate("/business-admin");
                break;
            default:
                navigate("/");
        }
    };

    const buttonText = rol === ROLES.MODERADOR ? "Panel de Moderador" : "Mis Negocios";

    return (
        <button
            type="button"
            className="btn btn-success"
            onClick={handleClick}
        >
            {buttonText}
        </button>
    );
};
