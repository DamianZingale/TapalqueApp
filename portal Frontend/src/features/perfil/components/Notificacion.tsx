import type { PropsNotificacion } from "../../../shared/types/PropsPerfil"

export const Notificacion: React.FC<PropsNotificacion> = ({id,asunto, fecha, descripcion}) => {
    return (
            <a href="#" className="list-group-item list-group-item-action" key={id}>
                <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">{asunto}</h5>
                    <small className="text-body-secondary">{fecha}</small>
                </div>
                <p className="mb-1">{descripcion}</p>
            </a>
            )
}
