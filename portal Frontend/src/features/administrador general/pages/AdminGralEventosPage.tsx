import { useState, useEffect } from "react";
import { Title } from "../../../shared/components/Title"
import { ListadoLocalesUsuarios } from "../components/ListadoLocales"
import { BotonesAccionAdmin } from "../components/BotonesAccionAdmin";
import { BotonAgregar } from "../components/BotonAgregar";
import { fetchEventos, type Evento } from "../../../services/fetchEventos";

export const AdminGralEventosPage = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
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

    const eventosFormatted = eventos.map(evento => ({
        id: evento.id.toString(),
        estado: "Activo",
        nombre: evento.nombreEvento,
        direccionOtipo: `${evento.fechaInicio}${evento.fechaFin ? ` - ${evento.fechaFin}` : ''}`,
    }));

    const selectedEvento = eventosFormatted.find((evento) => evento.id === selectedId);

    if (loading) {
        return <div><Title text="Eventos" /><p className="text-center">Cargando eventos...</p></div>;
    }

    return (
        <>
            <Title text="Eventos" />
            <BotonAgregar />
            {selectedEvento && (
                <BotonesAccionAdmin id={selectedEvento.id} estado={selectedEvento.estado} />)}

            {eventosFormatted.length === 0 ? (
                <p className="text-center">No hay eventos disponibles.</p>
            ) : (
                eventosFormatted.map((evento) => (
                    <ListadoLocalesUsuarios
                        key={evento.id}
                        {...evento}
                        onSelect={(id) => setSelectedId(id)}
                        selectedId={selectedId}
                    />
                ))
            )}
        </>
    )
}
