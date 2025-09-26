import { useState } from "react";
import { Title } from "../../../shared/components/Title"
import { ListadoLocalesUsuarios } from "../components/ListadoLocales"
import { BotonesAccionAdmin } from "../components/BotonesAccionAdmin";
import { BotonAgregar } from "../components/BotonAgregar";

export const AdminGralComerciosPage = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [locales] = useState([
        {
            id: "1",
            estado: "Activo",
            nombre: "Libreria Sarmiento",
            direccionOtipo: "Sarmiento 570",
        },
        {
            id: "2",
            estado: "Inactivo",
            nombre: "Kiosko La Plaza",
            direccionOtipo: "San Martin 150",
        },
    ]);

    const selectedLocal = locales.find((local) => local.id === selectedId);

    return (
        <>
            <Title text="Comercios" />
            <BotonAgregar />
            {selectedLocal && (
                <BotonesAccionAdmin estado={selectedLocal.estado} />)}

            {locales.map((local) => (
                <ListadoLocalesUsuarios
                    key={local.id}
                    {...local}
                    onSelect={(id) => setSelectedId(id)}
                    selectedId={selectedId}
                />
            ))}
        </>
    )
}
