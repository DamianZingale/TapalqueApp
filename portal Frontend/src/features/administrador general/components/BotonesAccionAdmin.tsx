import type { BotonesAccionProps } from "../../../shared/types/PropsListadoLocales"

export const BotonesAccionAdmin: React.FC<BotonesAccionProps> = ({estado}) => {
    return (
        <div className="d-flex gap-2 justify-content-center mb-3">
            <button className={`btn ${estado === "Activo" ? "btn-warning" : "btn-success"}`}>
                {estado === "Activo" ? "Desactivar" : "Activar"}
            </button>
            <button className="btn btn-primary">Editar</button>
            <button className="btn btn-danger">Eliminar</button>
        </div>
    )
}
