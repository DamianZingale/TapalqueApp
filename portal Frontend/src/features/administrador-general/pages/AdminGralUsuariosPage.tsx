import { useState } from "react";
import { Title } from "../../../shared/components/Title"
import { BotonAgregar } from "../components/BotonAgregar"
import { BotonesAccionAdmin } from "../components/BotonesAccionAdmin";
import { ListadoLocalesUsuarios } from "../components/ListadoLocales";

export const AdminGralUsuariosPage = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
        const [locales] = useState([
            {
                id: "1",
                estado: "Activo",
                nombre: "Santiago Lamot",
                direccionOtipo: "Adm. Gastronomico",
            },
            {
                id: "2",
                estado: "Inactivo",
                nombre: "Damian Zingale",
                direccionOtipo: "Adm. Hospedaje",
            },
        ]);
        const selectedLocal = locales.find((local) => local.id === selectedId);
    
    return (
        <>
            <Title text="Usuarios" />
            <BotonAgregar />
            {selectedLocal && (
                            <BotonesAccionAdmin id={selectedLocal.id} estado={selectedLocal.estado} />)}
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
