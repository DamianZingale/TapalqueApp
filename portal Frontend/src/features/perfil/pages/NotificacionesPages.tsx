import { Title } from "../../../shared/components/Title"
import { Notificacion } from "../components/Notificacion"

const data = [
    {
        "id":"1",
        "asunto": "Actualización de reserva",
        "fecha": "2025-09-11T18:30:00",
        "descripcion": "Tu reserva en Termas Tapalqué ha sido confirmada para el día sábado a las 10:00 hs."
    },
    {
        "id":"2",
        "asunto": "Nuevo comercio disponible",
        "fecha": "2025-09-10T14:15:00",
        "descripcion": "Se ha agregado 'Panadería La Plaza' al listado de comercios locales."
    },
    {
        "id":"3",
        "asunto": "Recordatorio de sesión",
        "fecha": "2025-09-09T09:00:00",
        "descripcion": "No olvides iniciar sesión para acceder a tus pedidos y reservas."
    }
]

export const NotificacionesPages = () => {
    return (
        <div className="container min-vh-100 d-flex flex-column">
            <Title text="Notificaciones" />

            <div className="list-group">
                {
                    data.map((data)=>(
                        <Notificacion
                            id={data.id}
                            asunto={data.asunto}
                            fecha={data.fecha}
                            descripcion={data.descripcion}
                        />
                    ))
                }
            </div>
        </div>
    )
}
