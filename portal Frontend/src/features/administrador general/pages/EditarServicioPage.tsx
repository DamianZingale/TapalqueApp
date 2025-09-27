import { useEffect, useState } from "react";
import { Title } from "../../../shared/components/Title"
import { FormIngresoEditar } from "../components/FormIngresoEditar";
import { CampoServicio } from "../types/PropsIngresosNuevosAdminGeneral";
import type { FormData } from "../types/PropsIngresosNuevosAdminGeneral";
import { ImagenesActuales } from "../components/ImagenesActuales";
import { useLocation } from "react-router-dom";

export const EditarServicioPage = () => {
    const location = useLocation();
    const { id } = location.state as { id: string };
    
    useEffect(() => {
        alert("Se recibio el id: " + id + " para ir a buscar datos al backend")
    }, [])


    //Aca ir a buscar datos al backend para hacer el update
    const [servicio] = useState({
        name: "Plomeria Raulito",
        descripcion: "el mejor precio 20 años de trayectoria O.o",
        horario: "Podes llamarme las 24hs.",
        whatsapp: "228168388",
        images: ["https://miservidor.com/img1.jpg"],
    });

    const handleUpdate = async (data: FormData) => {
        // enviar al backend los datos actualizados
        alert("Datos actualizados:\n" + JSON.stringify(data, null, 2));
    };

    return (
        <>
            <Title text="Editar Servicio" />
            <FormIngresoEditar tipoCampos={CampoServicio} initialData={servicio} onSubmit={handleUpdate} />
            <ImagenesActuales files={servicio.images} />
        </>
    )
}
