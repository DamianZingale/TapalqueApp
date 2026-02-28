import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { Carrusel } from "../../../shared/components/Carrusel";
import { Description } from "../../../shared/components/Description";
import { Title } from "../../../shared/components/Title";
import { SocialLinks } from "../../../shared/components/SocialLinks";
import { LoadingSkeleton, ApiErrorDisplay } from "../../../shared/components/ErrorBoundary";
import { fetchServicioById, type Servicio } from "../../../services/fetchServicios";

export default function ServiciosDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState<Servicio | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadServicio = async () => {
        if (!id) return;
        
        try {
            setError(null);
            setLoading(true);
            const servicio = await fetchServicioById(id);
            setData(servicio);
            if (!servicio) {
                setError("Servicio no encontrado");
            }
        } catch (err) {
            console.error("Error cargando servicio:", err);
            setError("No se pudo cargar el servicio. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServicio();
    }, [id]);

    if (loading) {
        return (
            <div className="container py-5">
                <LoadingSkeleton height="300px" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="container py-5">
                <ApiErrorDisplay 
                    error={error || "Servicio no encontrado"} 
                    onRetry={loadServicio} 
                />
            </div>
        );
    }

    const imagenes = data.imagenes?.map(img => img.imagenUrl) || [];

    return (
        <div className="container">
            <Title text={data.titulo} />
            <Carrusel images={imagenes} />
            <SocialLinks
                facebook={data.facebook}
                instagram={data.instagram}
            />
            <Description description={data.descripcion || ""} />
            {data.direccion && (
                <div className="text-center my-3">
                    <strong>Dirección:</strong> {data.direccion}
                </div>
            )}
            {data.latitud && data.longitud && (
                <div className="text-center my-3">
                    <a
                        href={`https://www.google.com/maps?q=${data.latitud},${data.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                    >
                        📍 Cómo Llegar
                    </a>
                </div>
            )}
            {data.horario && <div className="text-center my-3"><strong>Horario:</strong> {data.horario}</div>}
            {data.telefono && <WhatsAppButton num={data.telefono} />}
        </div>
    );
}