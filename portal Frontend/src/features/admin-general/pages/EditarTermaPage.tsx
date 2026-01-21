import { useEffect, useState } from "react";
import { Title } from "../../../shared/components/Title"
import { FormIngresoEditar } from "../components/FormIngresoEditar";
import { CampoTerma } from "../types/PropsIngresosNuevosAdminGeneral";
import type { FormData } from "../types/PropsIngresosNuevosAdminGeneral";
import { ImagenesActuales } from "../components/ImagenesActuales";
import { useLocation } from "react-router-dom";

export const EditarTermaPage = () => {
    const location = useLocation();
    const { id } = location.state as { id: string };

    useEffect(() => {
        alert("Se recibio el id: " + id + " para ir a buscar datos al backend")
    }, [])


    //Aca ir a buscar datos al backend para hacer el update
    const [terma] = useState({
        titulo: "Termas de Tapalqué",
        descripcion: "Complejo termal con aguas minerales",
        horario: "Lunes a Domingo 9:00 a 20:00",
        urlMap: "https://maps.google.com/?q=Termas+Tapalqué",
        whatsapp: "2281234567",
        images: ["https://miservidor.com/terma1.jpg"],
    });

    const handleUpdate = async (data: FormData) => {
        // enviar al backend los datos actualizados
        alert("Datos actualizados:\n" + JSON.stringify(data, null, 2));
    };

    return (
        <>
            <Title text="Editar Terma" />
            <FormIngresoEditar tipoCampos={CampoTerma} initialData={terma} onSubmit={handleUpdate} />
            <ImagenesActuales files={terma.images} />
        </>
    )
}
