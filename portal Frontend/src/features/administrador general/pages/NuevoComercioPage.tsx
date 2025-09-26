import { Title } from "../../../shared/components/Title"
import FormIngresoAdminGeneral from "../components/FormIngresoAdminGeneral"
import { CampoComercio, type FormData } from "../types/PropsIngresosNuevosAdminGeneral"

export const NuevoComercioPage = () => {
    const handleSave = async (data: FormData) => {
    //aca van los envios de datos al backend!
    alert(JSON.stringify(data, null, 2));
};
    
    return (
        <>
        <Title text="Nuevo Comercio"/>
        <FormIngresoAdminGeneral tipoCampos={CampoComercio} onSubmit={handleSave} />
        </>
    )
}
