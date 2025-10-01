import { Title } from "../../../shared/components/Title"
import { CampoHospedaje, type FormData} from "../types/PropsIngresosNuevosAdminGeneral"
import {FormIngresoEditar} from "../components/FormIngresoEditar"

export const NuevoHospedajePage = () => {

    const handleSave = async (data: FormData) => {
        //aca van los envios de datos al backend!
        alert(JSON.stringify(data, null, 2));
    };
    
    return (
        <>
            <Title text="Nuevo Hospedaje"/>
            <FormIngresoEditar tipoCampos={CampoHospedaje} onSubmit={handleSave}/>
        </>
    )
}
