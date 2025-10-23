import { BotonOpciones } from "../../../shared/components/BotonOpciones"
import { Title } from "../../../shared/components/Title"

export const AdministradorGeneralPage = () => {
    return (
        <div className="vh-100 flex-column">
                    <Title text="Administrador General" />
                    <div className="d-grid gap-2 col-6 mx-auto">
                        <BotonOpciones texto="Gastronomicos" redireccion="gastronomicos" />
                        <BotonOpciones texto="Hospedajes" redireccion="hospedajes" />
                        <BotonOpciones texto="Comercios" redireccion="comercios" />
                        <BotonOpciones texto="Servicios" redireccion="servicios" />
                        <BotonOpciones texto="Gestion de Usuarios" redireccion="usuarios" />
                    </div>
                </div>
    )
}
