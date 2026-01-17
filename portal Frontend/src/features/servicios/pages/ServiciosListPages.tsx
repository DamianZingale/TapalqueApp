import { useEffect, useState } from "react";
import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";
import { fetchServicios, type Servicio } from "../../../services/fetchServicios";

export default function ServiciosListPage() {
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadServicios = async () => {
            try {
                const data = await fetchServicios();
                setServicios(data);
            } catch (err) {
                console.error("Error al cargar servicios:", err);
                setError("No se pudieron cargar los servicios.");
            } finally {
                setLoading(false);
            }
        };
        loadServicios();
    }, []);

    if (loading) {
        return (
            <div className="container text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando servicios...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-danger my-5">{error}</p>;
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
                        />
                    ))
                ) : (
                    <p className="text-center my-5">No hay servicios disponibles por el momento.</p>
                )}
            </div>
        </div>
    );
}