import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Calendario } from "../components/Calendario";
import { Title } from "../../../shared/components/Title";
import { Carrusel } from "../../../shared/components/Carrusel";
import { Description } from "../../../shared/components/Description";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { Subtitle } from "../../../shared/components/Subtitle";
import { fetchHospedajeById, Hospedaje } from "../../../services/fetchHospedajes";

export default function HospedajeDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState<Hospedaje | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarHospedaje = async () => {
            if (id) {
                setLoading(true);
                const hospedaje = await fetchHospedajeById(id);
                setData(hospedaje);
                setLoading(false);
            }
        };
        cargarHospedaje();
    }, [id]);

    if (loading) {
        return (
            <div className="container text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (!data) return <p className="text-center py-5">Hospedaje no encontrado</p>;

    // Convertir imágenes al formato esperado
    const imagenes = data.imagenes?.map(img => img.imagenUrl) || [];

    // Obtener tipo de hospedaje legible
    const tipoLabel = {
        'HOTEL': 'Hotel',
        'DEPARTAMENTO': 'Departamento',
        'CABAÑA': 'Cabaña',
        'CASA': 'Casa',
        'OTRO': 'Alojamiento'
    }[data.tipoHospedaje] || 'Alojamiento';

    return (
        <div className="container">
            <Title text={data.titulo} />
            <p className="text-center text-muted mb-3">
                <span className="badge bg-info">{tipoLabel}</span>
                {data.ubicacion && <span className="ms-2">{data.ubicacion}</span>}
            </p>
            <Carrusel images={imagenes} />
            <Description description={data.description} />

            {data.numWhatsapp && <WhatsAppButton num={data.numWhatsapp} />}

            <Subtitle text="¡Reserva ahora!" />
            <Calendario />

            {data.googleMapsUrl && (
                <div className="text-center my-4">
                    <a
                        href={data.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-dark"
                    >
                        Ver en Google Maps
                    </a>
                </div>
            )}
        </div>
    );
}
