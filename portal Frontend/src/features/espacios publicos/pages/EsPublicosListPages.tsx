import { useEffect, useState } from "react";
import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";
import { Link } from "react-router-dom";
import { fetchEspaciosPublicos, type EspacioPublico } from "../../../services/fetchEspaciosPublicos";

export default function EspaciosListPage() {
    const [espacios, setEspacios] = useState<EspacioPublico[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadEspacios = async () => {
            try {
                const data = await fetchEspaciosPublicos();
                setEspacios(data);
            } catch (err) {
                console.error("Error al cargar espacios públicos:", err);
                setError("No se pudieron cargar los espacios públicos.");
            } finally {
                setLoading(false);
            }
        };
        loadEspacios();
    }, []);

    if (loading) {
        return (
            <div className="container text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando espacios públicos...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-danger my-5">{error}</p>;
    }

    return (
        <div className="container my-4">
            <h1 className="text-center mb-4">Espacios Públicos</h1>
            <div className="row justify-content-center">
                {espacios.length > 0 ? (
                    espacios.map((espacio) => (
                        <div key={espacio.id} className="col-md-4 mb-4">
                            <Link to={`/espublicos/${espacio.id}`} className="text-decoration-none">
                                <Card
                                    id={String(espacio.id)}
                                    titulo={espacio.titulo}
                                    imagenUrl={espacio.imagenes?.[0]?.imagenUrl || "https://via.placeholder.com/400x200.png?text=Sin+Imagen"}
                                    direccion_local={espacio.direccion}
                                    tipo={SECCION_TYPE.ESP_PUBLICOS}
                                />
                            </Link>
                        </div>
                    ))
                ) : (
                    <p className="text-center my-5">No hay espacios públicos disponibles por el momento.</p>
                )}
            </div>
        </div>
    );
}