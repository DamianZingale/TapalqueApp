import { useParams } from "react-router-dom";
import { serviciosMock } from './mocks/mockServicios';

export default function ServiciosDetailPage() {
    const { id } = useParams();
    const servicio = serviciosMock.find((s) => s.id === id);

    if (!servicio) return <p>Servicio no encontrado</p>;

    return (
        <div className="container">
        <h1>{servicio.titulo}</h1>
        <p>{servicio.descripcion}</p>
        {/* Agregá Carrusel, Horarios, GMaps, WhatsAppButton si querés */}
        </div>
    );
}