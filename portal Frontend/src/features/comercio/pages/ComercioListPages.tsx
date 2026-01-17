import { useEffect, useState } from "react";
import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";
import { fetchComercios, type Comercio } from "../../../services/fetchComercios";

export default function ComercioListPage() {
    const [comercios, setComercios] = useState<Comercio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadComercios = async () => {
            try {
                const data = await fetchComercios();
                setComercios(data);
            } catch (err) {
                console.error("Error al cargar comercios:", err);
                setError("No se pudieron cargar los comercios.");
            } finally {
                setLoading(false);
            }
        };
        loadComercios();
    }, []);

    if (loading) {
        return (
            <div className="container text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando comercios...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-danger my-5">{error}</p>;
    }

    return (
        <div className="container">
            <h1 className="text-center my-4">Comercios</h1>
            <div className="row justify-content-center">
                {comercios.length > 0 ? (
                    comercios.map((comercio) => (
                        <Card
                            key={comercio.id}
                            id={String(comercio.id)}
                            titulo={comercio.titulo}
                            imagenUrl={comercio.imagenes?.[0]?.imagenUrl || "https://via.placeholder.com/400x200.png?text=Sin+Imagen"}
                            direccion_local={comercio.direccion}
                            tipo={SECCION_TYPE.COMERCIO}
                        />
                    ))
                ) : (
                    <p className="text-center my-5">No hay comercios disponibles por el momento.</p>
                )}
            </div>
        </div>
    );
}