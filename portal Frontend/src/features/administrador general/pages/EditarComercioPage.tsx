import { useEffect, useState } from "react";
import { CampoComercio, type FormData } from "../types/PropsIngresosNuevosAdminGeneral";
import { Title } from "../../../shared/components/Title";
import { FormIngresoEditar } from "../components/FormIngresoEditar";
import { ImagenesActuales } from "../components/ImagenesActuales";
import { useLocation } from "react-router-dom";

export const EditarComercioPage = () => {
    const location = useLocation();
    const { id } = location.state as { id: string };

    useEffect(() => {
        alert("Se recibio el id: " + id + " para ir a buscar datos al backend")
    }, [])


    //Aca ir a buscar datos al backend para hacer el update
    const [servicio] = useState({
        name: "Despensa Los Santos",
        descripcion: "Podes acercarte a cualquiera de nuestras sucursales",
        horario: "Lunes a Domingo\nDe 08:00hs. a 22:00hs.",
        urlMap: "googlemaps.com/losantos",
        whatsapp: "228168388",
        images: ["https://miservidor.com/img1.jpg", "https://miservidor.com/img2.jpg"],
    });

    const handleUpdate = async (data: FormData) => {
        // enviar al backend los datos actualizados
        alert("Datos actualizados:\n" + JSON.stringify(data, null, 2));
    };

    return (
        <>
            <Title text="Editar Comercio" />
            <FormIngresoEditar tipoCampos={CampoComercio} initialData={servicio} onSubmit={handleUpdate} />
            <ImagenesActuales files={servicio.images} />
        </>
    )
}
