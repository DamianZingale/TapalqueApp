import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CampoUsuario, type FormData } from "../types/PropsIngresosNuevosAdminGeneral";
import { Title } from "../../../shared/components/Title";
import { FormIngresoEditar } from "../components/FormIngresoEditar";
import { AsignarLocalesAdmin } from "../components/AsignarLocalesAdmin";

export const EditarUsuarioPage = () => {
    const location = useLocation();
    const { id } = location.state as { id: string };

    useEffect(() => {
        alert("Se recibio el id: " + id + " para ir a buscar datos al backend")
    }, [])

    //Aca ir a buscar datos al backend para hacer el update
    const [usuario] = useState({
        firtname: "Santiago",
        lastname: "Lamot",
        dni: "222811223",
        email: "santiagolamot25@gmail.com",
        telefono: "2281683888",
        tipoAdmin: "adminGastro",
    });

    const handleUpdate = async (data: FormData) => {
        // enviar al backend los datos actualizados
        alert("Datos actualizados:\n" + JSON.stringify(data, null, 2));
    };

    const handleAsignar = async (idLocal: string) => {
        // enviar al backend la asignacion de local
        alert("Asignacion del local ID "+ idLocal+ " al usuario "+id);
    };
    return (
            <>
                <Title text="Editar Usuario" />
                <FormIngresoEditar tipoCampos={CampoUsuario} initialData={usuario} onSubmit={handleUpdate} />
                <AsignarLocalesAdmin idAdmin={id} onAsignar={handleAsignar}/>
            </>
        )

}
