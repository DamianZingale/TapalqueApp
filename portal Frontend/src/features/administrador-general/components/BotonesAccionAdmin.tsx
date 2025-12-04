import { useNavigate } from "react-router-dom";
import type { BotonesAccionProps } from "../../../shared/types/PropsAdminGeneral";

export const BotonesAccionAdmin: React.FC<BotonesAccionProps> = ({ id, estado }) => {
    const navigate = useNavigate();

    const handleClickEditar = () => {
        navigate("editar", {
        state: { id }, // pasás el id sin mostrarlo en la URL
        });
    };

    const handleActivarDesactivar = () => {
        alert(`Llamar al backend para cambiar estado del hospedaje ${id}`);
    };

    const handleEliminar = () => {
        alert("Llamar al backend con la petición DELETE");
    };

    return (
        <div className="">
        <button
            className={`btn ${estado === "Activo" ? "btn-warning" : "btn-success"}`}
            onClick={handleActivarDesactivar}
        >
            {estado === "Activo" ? "Desactivar" : "Activar"}
        </button>

        <button onClick={handleClickEditar} className="">
            Editar
        </button>

        <button onClick={handleEliminar} className="">
            Eliminar
        </button>
        </div>
    );
};
