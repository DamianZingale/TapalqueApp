import { BotonOpciones } from "../../../shared/components/BotonOpciones";
import { Title } from "../../../shared/components/Title";
import { BotonAdministrador } from "../components/BotonAdministrador";
import authService from "../../../services/authService";

// Roles: 1 = Moderador, 2 = Administrador, 3 = Usuario
const ROLES = {
    MODERADOR: 1,
    ADMINISTRADOR: 2,
    USUARIO: 3
};

export const PerfilPage = () => {
    const rol = authService.getRolUsuario();
    const esUsuarioComun = rol === ROLES.USUARIO;

    return (
        <div className="vh-100 flex-column">
            <Title text="Mi perfil" />
            <div className="d-grid gap-2 col-6 mx-auto">
                {/* Botón de administración: solo para moderador y admin */}
                <BotonAdministrador />

                {/* Datos personales: disponible para todos */}
                <BotonOpciones texto="Datos Personales" redireccion="datosPersonales" />

                {/* Opciones solo para usuarios comunes (no moderador ni admin) */}
                {esUsuarioComun && (
                    <>
                        <BotonOpciones texto="Notificaciones" redireccion="notificaciones" />
                        <BotonOpciones texto="Mis Pedidos" redireccion="misPedidos" />
                        <BotonOpciones texto="Mis Reservas" redireccion="misReservas" />
                    </>
                )}
            </div>
        </div>
    )
}
