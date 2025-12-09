import { BotonOpciones } from "../../../shared/components/BotonOpciones";
import { Title } from "../../../shared/components/Title";
import { BotonAdministrador } from "../components/BotonAdministrador";


export const PerfilPage = () => {
    return (
        <div className="">
            <Title text="Mi perfil" />
            <div className="">
                <BotonAdministrador />
                <BotonOpciones texto="Datos Personales" redireccion="datosPersonales" />
                <BotonOpciones texto="Notificaciones" redireccion="notificaciones" />
                <BotonOpciones texto="Mis Pedidos" redireccion="misPedidos" />
                <BotonOpciones texto="Mis Reservas" redireccion="misReservas" />
            </div>
        </div>
    )
}
