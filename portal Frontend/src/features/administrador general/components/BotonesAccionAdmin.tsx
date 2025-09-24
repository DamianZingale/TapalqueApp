import { useNavigate } from "react-router-dom"
import type { BotonesAccionProps } from "../../../shared/types/PropsAdminGeneral"

export const BotonesAccionAdmin: React.FC<BotonesAccionProps> = ({estado}) => {
    const navigate = useNavigate();
    //Aca falta llamo al backend para eliminar y desacticar el seleccionado.
    const handleClickEditar = () =>{
        navigate("editar")
    }

    return (
        <div className="d-flex gap-2 justify-content-center mb-3">
            <button className={`btn ${estado === "Activo" ? "btn-warning" : "btn-success"}`}>
                {estado === "Activo" ? "Desactivar" : "Activar"}
            </button>
            <button onClick={handleClickEditar}className="btn btn-primary">Editar</button>
            <button className="btn btn-danger">Eliminar</button>
        </div>
    )
}
