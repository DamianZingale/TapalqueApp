import { Title } from "../../../shared/components/Title"
import { Listado } from "../components/Listado"
const data = [
    {
        "id": "1",
        "estado": "Confirmada",
        "titulo": "Reserva en Hotel Tapalqué",
        "fecha": "2025-09-12T10:00:00"
    },
    {
        "id": "2",
        "estado": "Pendiente",
        "titulo": "Reserva en Cabañas El Molino",
        "fecha": "2025-09-14T15:30:00"
    },
    {
        "id": "3",
        "estado": "Cancelada",
        "titulo": "Reserva en Posada del Río",
        "fecha": "2025-09-10T18:00:00"
    },
    {
        "id": "4",
        "estado": "Confirmada",
        "titulo": "Reserva en Hospedaje La Plaza",
        "fecha": "2025-09-16T12:00:00"
    },
    {
        "id": "5",
        "estado": "Pendiente",
        "titulo": "Reserva en EcoHostel Tapalqué",
        "fecha": "2025-09-17T09:00:00"
    },
    {
        "id": "6",
        "estado": "Confirmada",
        "titulo": "Reserva en Casa Rural El Encuentro",
        "fecha": "2025-09-19T11:45:00"
    }
]

export const MisReservasPage = () => {
    return (
        <div className="container min-vh-100 d-flex flex-column">
            <Title text="Mis Reservas" />
            {data.map((data) => (
                <div key={data.id} className="mb-3">
                    <Listado
                        id={data.id}
                        estado={data.estado}
                        titulo={data.titulo}
                        fecha={data.fecha}
                    />
                </div>
            ))}
        </div>
    )
}
