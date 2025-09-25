import { useState } from "react";
import { BotonAgregar } from "../components/BotonAgregar";
import { ListadoLocales } from "../components/ListadoLocales";
import { Title } from "../../../shared/components/Title";
import { BotonesAccionAdmin } from "../components/BotonesAccionAdmin";

export const AdminGralServiciosPage = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [locales] = useState([
        {
            id: "1",
            estado: "Activo",
            nombre: "Plomero",
            direccion: "",
        },
        {
            id: "2",
            estado: "Inactivo",
            nombre: "Electricista",
            direccion: "",
        },
    ]);
    const selectedLocal = locales.find((local) => local.id === selectedId);


    return (
        <>
            <Title text="Servicios" />

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
