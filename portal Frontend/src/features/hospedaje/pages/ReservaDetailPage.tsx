import { useParams } from 'react-router-dom';

export const ReservaDetailPage = () => {
    const { id, fecha } = useParams();
    return (
        <div className="p-4">
            <h3>Reserva para el hospedaje {id}</h3>
            <p>Fecha seleccionada: {fecha}</p>
            {/* Mostrar disponibilidad, horarios, precios, etc */}
        </div>
    )
}
