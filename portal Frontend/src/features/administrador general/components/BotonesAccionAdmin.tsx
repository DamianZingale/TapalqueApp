import { useNavigate } from "react-router-dom"
import type { BotonesAccionProps } from "../../../shared/types/PropsAdminGeneral"

export const BotonesAccionAdmin: React.FC<BotonesAccionProps> = ({ id, estado }) => {
    
    const navigate = useNavigate();
    //Aca falta llamo al backend para eliminar y desacticar el seleccionado.
    const handleClickEditar = () => {
        navigate("editar", {
            state: { id } // acá pasás el id sin mostrarlo en la URL
        });
    }
    const handleActivarDesacticar =()=>{
        alert("Llamar al backend con la peticion delete")
    }
    const handleEliminar = () =>{
        alert("Llamar al backend con la peticion update para cambiar el estado")
    }

    return (
        <div className="d-flex gap-2 justify-content-center mb-3">
            <button className={`btn ${estado === "Activo" ? "btn-warning" : "btn-success"}`} onClick={handleActivarDesacticar}>
                {estado === "Activo" ? "Desactivar" : "Activar"}
            </button>
            <button onClick={handleClickEditar} className="btn btn-primary">Editar</button>
            <button className="btn btn-danger" onClick={handleEliminar}>Eliminar</button>
        </div>
    )
}
