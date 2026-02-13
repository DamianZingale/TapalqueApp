import { Title } from "../../../shared/components/Title"
import {FormIngresoEditar} from "../components/FormIngresoEditar"
import { CampoTerma } from "../types/PropsIngresosNuevosAdminGeneral"
import type { FormData } from "../types/PropsIngresosNuevosAdminGeneral"

export const NuevoTermaPage = () => {
    const handleSave = async (data: FormData) => {
        //aca van los envios de datos al backend!
        alert(JSON.stringify(data, null, 2));
    };

    return (
        <>
            <Title text="Nueva Terma" />
            <FormIngresoEditar tipoCampos={CampoTerma} onSubmit={handleSave} />
        </>
    )
}
