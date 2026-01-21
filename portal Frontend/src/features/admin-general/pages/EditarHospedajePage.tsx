import { useEffect, useState } from "react";
import { CampoHospedaje, type FormData } from "../types/PropsIngresosNuevosAdminGeneral";
import { Title } from "../../../shared/components/Title";
import { FormIngresoEditar } from "../components/FormIngresoEditar";
import { ImagenesActuales } from "../components/ImagenesActuales";
import { useLocation } from "react-router-dom";

export const EditarHospedajePage = () => {
    const location = useLocation();
    const { id } = location.state as { id: string };

    useEffect(() => {
        alert("Se recibio el id: " + id + " para ir a buscar datos al backend")
    }, [])


    //Aca ir a buscar datos al backend para hacer el update
    const [hospedaje] = useState({
        name: "Hoetl Tapalqué",
        address: "9 de julio 198",
        whatapp: "1122334455",
        descripcion: "Hotel con desayuno incluido \nEstacionamiento incluido",
        urlMap: "https://maps.google.com/?q=hotel+tapalque",
        images: [
            "https://miservidor.com/img1.jpg",
            "https://miservidor.com/img2.jpg"
        ]
    });

    const handleUpdate = async (data: FormData) => {
        // enviar al backend los datos actualizados
        alert("Datos actualizados:\n" + JSON.stringify(data, null, 2));
    };

    return (
        <>
            <Title text="Editar Hospedaje" />
            <FormIngresoEditar tipoCampos={CampoHospedaje} initialData={hospedaje} onSubmit={handleUpdate} />
            <ImagenesActuales files={hospedaje.images} />
        </>
    )
}
