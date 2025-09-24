import { useEffect, useState } from "react";
import { Title } from "../../../shared/components/Title"
import { ListadoLocales } from "../components/ListadoLocales"
import { BotonesAccionAdmin } from "../components/BotonesAccionAdmin";

export const AdminGralComerciosPage = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [locales] = useState([
        {
            id: "1",
            estado: "Activo",
            nombre: "La Clandestina",
            direccion: "Complejo termal de Tapalqué",
        },
        {
            id: "2",
            estado: "Inactivo",
            nombre: "La Clandestina",
            direccion: "Av. Hipolito Yrigoyen N°123",
        },
    ]);

    const selectedLocal = locales.find((local) => local.id === selectedId);

    return (
        <>
            <Title text="Comercios" />

            {selectedLocal && (
                <BotonesAccionAdmin estado={selectedLocal.estado} />)}

            {locales.map((local) => (
                <ListadoLocales
                    key={local.id}
                    {...local}
                    onSelect={(id) => setSelectedId(id)}
                    selectedId={selectedId}
                />
            ))}
        </>
    )
}
