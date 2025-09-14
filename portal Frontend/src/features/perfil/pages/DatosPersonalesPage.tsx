import { Title } from "../../../shared/components/Title"
import { CambiarContraseña } from "../components/CambiarContrasenia"
import { DatosPersonales } from "../components/DatosPersonales"

export const DatosPersonalesPage = () => {
    return (
        <div className="container vh-100 flex-column">
            <Title text= "Datos Personales"/>
            <DatosPersonales/>
            <CambiarContraseña/>
        </div>
    )
}
