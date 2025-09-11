import { Title } from "../../../shared/components/Title";
import { BotonOpciones } from "../components/BotonOpciones";

export const PerfilPage = () => {

    return (
        <div className="vh-100 flex-column">
            <Title text="Mi perfil" />
            <div className="d-grid gap-2 col-6 mx-auto">
                <BotonOpciones texto="Datos Personales" redireccion="datosPersonales"/>
                <BotonOpciones texto="Notificaciones" redireccion="notificaciones"/>
                <BotonOpciones texto="Mis Pedidos" redireccion="misPedidos"/>
                <BotonOpciones texto="Mis Reservas" redireccion="misReservas"/>
            </div>
        </div>
    )
}
