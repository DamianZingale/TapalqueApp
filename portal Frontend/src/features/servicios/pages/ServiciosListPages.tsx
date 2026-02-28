import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";
import { fetchServicios, type Servicio } from "../../../services/fetchServicios";
import { LoadingSkeleton, ApiErrorDisplay } from "../../../shared/components/ErrorBoundary";

export default function ServiciosListPage() {
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
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

    const tags = useMemo(() => {
        const allTags = servicios
            .map((s) => s.tag)
            .filter((t): t is string => !!t);
        return [...new Set(allTags)].sort();
    }, [servicios]);

    const filteredServicios = useMemo(() => {
        if (!selectedTag) return servicios;
        return servicios.filter((s) => s.tag === selectedTag);
    }, [servicios, selectedTag]);

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
            <title>Servicios en Tapalqué | Profesionales y Empresas</title>
            <meta name="description" content="Encontrá servicios profesionales y empresas de Tapalqué. Médicos, talleres, peluquerías y más en un solo lugar." />
            <link rel="canonical" href="https://tapalqueapp.com.ar/servicios" />
            <h1 className="text-center my-4">Servicios</h1>

            {tags.length > 0 && (
                <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                    {tags.map((tag) => (
                        <button
                            key={tag}
                            className={`btn btn-sm ${selectedTag === tag ? "btn-secondary" : "btn-outline-secondary"}`}
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        >
                            {tag}
                        </button>
                    ))}
                    {selectedTag && (
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setSelectedTag(null)}
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            )}

            <div className="row justify-content-center">
                {filteredServicios.length > 0 ? (
                    filteredServicios.map((servicio) => (
                        <Card
                            key={servicio.id}
                            id={String(servicio.id)}
                            titulo={servicio.titulo}
                            imagenUrl={servicio.imagenes?.[0]?.imagenUrl || "https://via.placeholder.com/400x200.png?text=Sin+Imagen"}
                            direccion_local={servicio.horario || ""}
                            schedule={servicio.telefono}
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
