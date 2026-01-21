import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";
import { fetchServicios, type Servicio } from "../../../services/fetchServicios";
import { LoadingSkeleton, ApiErrorDisplay } from "../../../shared/components/ErrorBoundary";

export default function ServiciosListPage() {
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loadServicios = async () => {
        try {
            setError(null);
            const data = await fetchServicios();
            setServicios(data);
        } catch (err) {
            console.error("Error al cargar servicios:", err);
            setError("No se pudieron cargar los servicios. Intenta recargar la página.");
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (servicio: Servicio) => {
        navigate(`/servicios/${servicio.id}`, {
            state: { servicio },
        });
    };

    useEffect(() => {
        loadServicios();
    }, []);

    if (loading) {
        return (
            <div className="container py-5">
                <h1 className="text-center mb-4">Servicios</h1>
                <LoadingSkeleton count={3} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <h1 className="text-center mb-4">Servicios</h1>
                <ApiErrorDisplay error={error} onRetry={loadServicios} />
            </div>
        );
    }

    return (
        <div className="container">
            <h1 className="text-center my-4">Servicios</h1>
            <div className="row justify-content-center">
                {servicios.length > 0 ? (
                    servicios.map((servicio) => (
                        <Card
                            key={servicio.id}
                            id={String(servicio.id)}
                            titulo={servicio.titulo}
                            imagenUrl={servicio.imagenes?.[0]?.imagenUrl || "https://via.placeholder.com/400x200.png?text=Sin+Imagen"}
                            direccion_local={servicio.horario || ""}
                            tipo={SECCION_TYPE.SERVICIOS}
                            onClick={() => handleCardClick(servicio)}
                        />
                    ))
                ) : (
                    <p className="text-center my-5">No hay servicios disponibles por el momento.</p>
                )}
            </div>
        </div>
    );
}