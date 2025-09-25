import { useState } from "react";
import { BotonAgregar } from "../components/BotonAgregar";
import { BotonesAccionAdmin } from "../components/BotonesAccionAdmin";
import { ListadoLocales } from "../components/ListadoLocales";
import { Title } from "../../../shared/components/Title";

export const AdminGralHospedajesPage = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [locales] = useState([
        {
            id: "1",
            estado: "Activo",
            nombre: "Hotel Coope",
            direccion: "9 de Julio 999",
        },
        {
            id: "2",
            estado: "Inactivo",
            nombre: "Hospedaje YPF",
            direccion: "Ruta 51 km 260",
        },
    ]);
    const selectedLocal = locales.find((local) => local.id === selectedId);

    return (
        <>
            <Title text="Hospedajes"/>
            <BotonAgregar />
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
