import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";
import { useEffect, useState } from "react";
import { fetchHospedajes } from "../../../services/fetchHospedajes";
import type { Hospedaje } from "../../../services/fetchHospedajes";


export default function HospedajeListPage() {
    const [hospedajes, setHospedajes] = useState<Hospedaje[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHospedajes()
        .then((data) => setHospedajes(data))
        .catch((err) => {
            console.error("Error al cargar hospedajes:", err);
            setError("No se pudieron cargar los hospedajes.");
        })
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-center my-5">Cargando hospedajes...</p>;
    if (error) return <p className="text-center text-danger my-5">{error}</p>;

    return (
        <div className="container">
        <h1 className="text-center my-4">Hospedajes</h1>
        <div className="row justify-content-center">
            {hospedajes.map((hospedaje) => (
            <Card
                key={hospedaje.id}
                id={String(hospedaje.id)}
                titulo={hospedaje.titulo}
                imagenUrl={hospedaje.imagenes?.[0] || "https://via.placeholder.com/400x200.png?text=Sin+Imagen"}
                tipo={SECCION_TYPE.HOSPEDAJES}
                direccion_local={hospedaje.ubicacion}
            />
            ))}
            {hospedajes.length === 0 && (
                <p className="text-center my-5">No hay hospedajes disponibles por el momento.</p>
            )}
        </div>
        </div>
    );
}