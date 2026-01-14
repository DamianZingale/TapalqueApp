import { useEffect, useState } from "react";
import { Card } from "../../../shared/components/Card";
import { fetchEventos, type Evento } from "../../../services/fetchEventos";

export default function EventosListPage() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEventos = async () => {
            setLoading(true);
            const data = await fetchEventos();
            setEventos(data);
            setLoading(false);
        };
        loadEventos();
    }, []);

    if (loading) {
        return <div className="container"><h1 className="text-center my-4">Cargando eventos...</h1></div>;
    }

    return (
        <div className="container">
            <h1 className="text-center my-4">Eventos</h1>
            {eventos.length === 0 ? (
                <p className="text-center">No hay eventos disponibles en este momento.</p>
            ) : (
                <div className="row justify-content-center">
                    {eventos.map((evento) => (
                        <Card
                        key={evento.id}
                        id={evento.id}
                        titulo={evento.nombreEvento}
                        imagenUrl={evento.imagenes[0]?.imagenUrl || "https://via.placeholder.com/300"}
                        direccion_local={`${evento.fechaInicio}${evento.fechaFin ? ` - ${evento.fechaFin}` : ''}`}
                        tipo="eventos"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
