import { useState, useEffect } from "react";
import { Title } from "../../../shared/components/Title"
import { ListadoLocalesUsuarios } from "../components/ListadoLocales"
import { BotonesAccionAdmin } from "../components/BotonesAccionAdmin";
import { BotonAgregar } from "../components/BotonAgregar";
import { fetchTermas, type Terma } from "../../../services/fetchTermas";

export const AdminGralTermasPage = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [termas, setTermas] = useState<Terma[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTermas = async () => {
            setLoading(true);
            const data = await fetchTermas();
            setTermas(data);
            setLoading(false);
        };
        loadTermas();
    }, []);

    const termasFormatted = termas.map(terma => ({
        id: terma.id.toString(),
        estado: "Activo",
        nombre: terma.titulo,
        direccionOtipo: terma.horario,
    }));

    const selectedLocal = termasFormatted.find((local) => local.id === selectedId);

    if (loading) {
        return <div><Title text="Termas" /><p className="text-center">Cargando termas...</p></div>;
    }

    return (
        <>
            <Title text="Termas" />
            <BotonAgregar />
            {selectedLocal && (
                <BotonesAccionAdmin id={selectedLocal.id} estado={selectedLocal.estado} />)}

            {termasFormatted.length === 0 ? (
                <p className="text-center">No hay termas disponibles.</p>
            ) : (
                termasFormatted.map((local) => (
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
