import type { PropsNotificacion } from "../../../shared/types/PropsPerfil"

export const Notificacion: React.FC<PropsNotificacion> = ({id,asunto, fecha, descripcion}) => {
    return (
            <a href="#" className="" key={id}>
                <div className="">
                    <h5 className="">{asunto}</h5>
                    <small className="">{fecha}</small>
                </div>
                <p className="">{descripcion}</p>
            </a>
            )
}
