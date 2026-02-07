import { useState, useEffect } from "react";
import { BotonAgregar } from "../components/BotonAgregar";
import { ListadoLocalesUsuarios } from "../components/ListadoLocales";
import { Title } from "../../../shared/components/Title";
import { BotonesAccionAdmin } from "../components/BotonesAccionAdmin";
import { fetchServicios, type Servicio } from "../../../services/fetchServicios";

export const AdminGralServiciosPage = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadServicios = async () => {
            setLoading(true);
            const data = await fetchServicios();
            setServicios(data);
            setLoading(false);
        };
        loadServicios();
    }, []);

    const serviciosFormatted = servicios.map(servicio => ({
        id: servicio.id.toString(),
        estado: "Activo",
        nombre: servicio.titulo,
        direccionOtipo: servicio.horario,
    }));

    const selectedLocal = serviciosFormatted.find((local) => local.id === selectedId);

    if (loading) {
        return <div><Title text="Servicios" /><p className="text-center">Cargando servicios...</p></div>;
    }

    return (
        <>
            <Title text="Servicios" />

            <BotonAgregar />
            {selectedLocal && (
                <BotonesAccionAdmin id={selectedLocal.id} estado={selectedLocal.estado} />)}

            {serviciosFormatted.length === 0 ? (
                <p className="text-center">No hay servicios disponibles.</p>
            ) : (
                serviciosFormatted.map((local) => (
                    <ListadoLocalesUsuarios
                        key={local.id}
                        {...local}
                        onSelect={(id) => setSelectedId(id)}
                        selectedId={selectedId}
                    />
                ))
            )}
        </>
    )
}
