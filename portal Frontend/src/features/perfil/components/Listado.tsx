import type { PropsListado } from "../../../shared/types/PropsPerfil"

export const Listado: React.FC<PropsListado> = ({ id, estado, titulo, fecha }) => {
    return (
        <div className="card text-center">
            <div className="card-header">
                {estado}
            </div>
            <div className="card-body">
                <h5 className="card-title">{titulo}</h5>
                <a href="#" className="btn btn-secondary">Ver mas {id}</a>
            </div>
            <div className="card-footer text-body-secondary">
                {fecha}
            </div>
        </div>
    )
}
