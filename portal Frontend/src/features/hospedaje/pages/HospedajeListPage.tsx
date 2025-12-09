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

    if (loading) return <p className="">Cargando hospedajes...</p>;
    if (error) return <p className="">{error}</p>;

    return (
        <div className="">
        <h1 className="">Hospedajes</h1>
        <div className="">
            {hospedajes.map((hospedaje) => (
            <Card
                key={hospedaje.id}
                id={hospedaje.id}
                titulo={hospedaje.nombre}
                imagenUrl={hospedaje.imagenes[0]}
                tipo={SECCION_TYPE.HOSPEDAJES}
                direccion_local={hospedaje.ubicacion}
            />
            ))}
            {hospedajes.length === 0 && (
                <p className="">No hay hospedajes disponibles por el momento.</p>
            )}

        </div>
        </div>
    );
}