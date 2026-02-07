import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";
import { fetchComercios, type Comercio } from "../../../services/fetchComercios";

export default function ComercioListPage() {
    const [comercios, setComercios] = useState<Comercio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const navigate = useNavigate();

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

    const tags = useMemo(() => {
        const allTags = comercios
            .map((c) => c.tag)
            .filter((t): t is string => !!t);
        return [...new Set(allTags)].sort();
    }, [comercios]);

    const filteredComercios = useMemo(() => {
        if (!selectedTag) return comercios;
        return comercios.filter((c) => c.tag === selectedTag);
    }, [comercios, selectedTag]);

    const handleCardClick = (comercio: Comercio) => {
        navigate(`/comercio/${comercio.id}`, {
            state: { comercio },
        });
    };

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
                {filteredComercios.length > 0 ? (
                    filteredComercios.map((comercio) => (
                        <Card
                            key={comercio.id}
                            id={String(comercio.id)}
                            titulo={comercio.titulo}
                            imagenUrl={comercio.imagenes?.[0]?.imagenUrl || "https://via.placeholder.com/400x200.png?text=Sin+Imagen"}
                            direccion_local={comercio.direccion}
                            tipo={SECCION_TYPE.COMERCIO}
                            onClick={() => handleCardClick(comercio)}
                        />
                    ))
                ) : (
                    <p className="text-center my-5">No hay comercios disponibles por el momento.</p>
                )}
            </div>
        </div>
    );
}
