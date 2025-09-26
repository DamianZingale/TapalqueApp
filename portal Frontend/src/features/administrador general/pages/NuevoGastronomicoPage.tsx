import { Title } from "../../../shared/components/Title"
import { CamposGastronomico, type FormData } from "../types/PropsIngresosNuevosAdminGeneral"
import FormIngresoAdminGeneral from "../components/FormIngresoAdminGeneral"

const handleSave = async (data: FormData) => {
    //aca van los envios de datos al backend!
    alert(JSON.stringify(data, null, 2));
};

export const NuevoGastronomicoPage = () => {
    return (
        <>
            <Title text="Nuevo local gastronomico" />
            <FormIngresoAdminGeneral tipoCampos={CamposGastronomico} onSubmit={handleSave} />
        </>
    )
}
