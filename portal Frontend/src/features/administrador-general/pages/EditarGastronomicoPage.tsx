import { useEffect, useState } from "react"
import { Title } from "../../../shared/components/Title"
import { FormIngresoEditar } from "../components/FormIngresoEditar"
import { CamposGastronomico } from "../types/PropsIngresosNuevosAdminGeneral"
import { type FormData } from "../types/PropsIngresosNuevosAdminGeneral"
import { ImagenesActuales } from "../components/ImagenesActuales"
import { useLocation } from "react-router-dom"

export const EditarGastronomicoPage = () => {
    const location = useLocation();
    const { id } = location.state as { id: string };

    useEffect(() => {
        alert("Se recibio el id: " + id + " para ir a buscar datos al backend")
    }, [])


    //Aca ir a buscar datos al backend para hacer el update
    const [gastro] = useState({
        name: "Club Social",
        address: "9 de julio 568",
        phone: "2281636232",
        email: "clubsococialtapalque@gmail.com",
        coord: "-123456, 1233555",
        images: ["https://miservidor.com/img1.jpg"],
    });

    const handleUpdate = async (data: FormData) => {
        // enviar al backend los datos actualizados
        alert("Datos actualizados:\n" + JSON.stringify(data, null, 2));
    };

    return (
        <>
            <Title text="Editar local gastronomico" />
            <FormIngresoEditar tipoCampos={CamposGastronomico} initialData={gastro} onSubmit={handleUpdate} />
            <ImagenesActuales files={gastro.images} />
        </>
    )
}
