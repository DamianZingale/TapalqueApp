import { useEffect, useState } from "react";
import { Title } from "../../../shared/components/Title"
import { FormIngresoEditar } from "../components/FormIngresoEditar";
import { CampoEvento } from "../types/PropsIngresosNuevosAdminGeneral";
import type { FormData } from "../types/PropsIngresosNuevosAdminGeneral";
import { ImagenesActuales } from "../components/ImagenesActuales";
import { useLocation } from "react-router-dom";

export const EditarEventoPage = () => {
    const location = useLocation();
    const { id } = location.state as { id: string };

    useEffect(() => {
        alert("Se recibio el id: " + id + " para ir a buscar datos al backend")
    }, [])


    //Aca ir a buscar datos al backend para hacer el update
    const [evento] = useState({
        nombreEvento: "Fiesta de la Tradición",
        lugar: "Plaza Principal",
        horario: "18:00 hs",
        fechaInicio: "2026-11-15",
        fechaFin: "2026-11-16",
        telefonoContacto: "2281234567",
        nombreContacto: "Juan Pérez",
        images: ["https://miservidor.com/evento1.jpg"],
    });

    const handleUpdate = async (data: FormData) => {
        // enviar al backend los datos actualizados
        alert("Datos actualizados:\n" + JSON.stringify(data, null, 2));
    };

    return (
        <>
            <Title text="Editar Evento" />
            <FormIngresoEditar tipoCampos={CampoEvento} initialData={evento} onSubmit={handleUpdate} />
            <ImagenesActuales files={evento.images} />
        </>
    )
}
