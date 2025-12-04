import { useHoteles } from "../hooks/useHoteles"
import { useNavigate } from "react-router-dom"

export const HotelesPage = () => {
    const { hoteles, toggleEstado } = useHoteles()
    const navigate = useNavigate()

    return (
        <div className="">
        <h2>Listado de Hoteles</h2>
        <button className="" onClick={() => navigate("/admin/hospedajes/nuevo")}>
            Agregar nuevo hotel
        </button>

        {hoteles.map((hotel) => (
            <div key={hotel.id} className="">
            <h4>{hotel.nombre}</h4>
            <p><strong>Estado:</strong> {hotel.estado}</p>
            <p><strong>Habitaciones:</strong> {hotel.habitaciones.length}</p>
            <button
                className={`btn ${hotel.estado === "Activo" ? "btn-warning" : "btn-success"} me-2`}
                onClick={() => toggleEstado(hotel.id)}
            >
                {hotel.estado === "Activo" ? "Desactivar" : "Activar"}
            </button>
            <button className="" onClick={() => navigate(`/editar/${hotel.id}`)}>
                Editar
            </button>
            </div>
        ))}
        </div>
    )
}