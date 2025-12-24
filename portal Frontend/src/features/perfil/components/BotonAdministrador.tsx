import { useNavigate } from "react-router-dom";
import { getRolUsuario } from "../../../shared/utils/auth";

export const BotonAdministrador = () => {
    const navegate = useNavigate()
    const rol = getRolUsuario()
    // pongan 1 en rol si quieren probar el adminGeneral
    
    const handleClick = () => {
        switch (rol) {
            case 1:
                navegate("/admin")
                break;
            case 2:
                navegate("/gastronomia/admin")
                break;
            case 3:
                navegate("/hospedaje/admin")
                break;
            default:
                navegate("/")
        }
    }

    return (
        <button
            type="button"
            className="btn btn-success"
            onClick={handleClick}
        >
            Administrar
        </button>
    );
};
