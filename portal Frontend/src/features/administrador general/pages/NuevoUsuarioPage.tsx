import { Title } from "../../../shared/components/Title"
import FormIngresoAdminGeneral from "../components/FormIngresoAdminGeneral"
import { CampoUsuario } from "../types/PropsIngresosNuevosAdminGeneral"
import { type FormData } from "../types/PropsIngresosNuevosAdminGeneral"

const handleSave = async (data: FormData) => {
    //aca van los envios de datos al backend!
    alert(JSON.stringify(data, null, 2));
}
export const NuevoUsuarioPage = () => {
    return (
        <>
            <Title text="Nuevo Usuario" />
            <FormIngresoAdminGeneral tipoCampos={CampoUsuario} onSubmit={handleSave} />
        </>
    )
}
