import { api } from "../config/api";

export interface Usuario {
    id: number;
    nombre: string;
    apellido?: string;
    email: string;
    telefono?: string;
    direccion?: string;
    rol: string;
    emailVerified: boolean;
    activo?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateProfileData {
    nombre?: string;
    apellido?: string;
    direccion?: string;
}

export interface ChangePasswordData {
    passwordActual: string;
    passwordNueva: string;
}

export interface NuevoUsuario {
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
    direccion?: string;
    rol: number;
}

export const ROLES = {
    MODERADOR: 1,
    ADMINISTRADOR: 2,
    USUARIO: 3
};

export const getRoleName = (rol: number): string => {
    switch (rol) {
        case ROLES.MODERADOR: return "Moderador";
        case ROLES.ADMINISTRADOR: return "Administrador";
        case ROLES.USUARIO: return "Usuario";
        default: return "Desconocido";
    }
};

export async function fetchUsuarios(): Promise<Usuario[]> {
    try {
        const response = await api.get<Usuario[]>("/user/all");
        return response;
    } catch (error) {
        console.error("Error en fetchUsuarios:", error);
        return [];
    }
}

export async function fetchUsuarioById(id: number): Promise<Usuario | null> {
    try {
        const response = await api.get<Usuario>(`/user/${id}`);
        return response;
    } catch (error) {
        console.error("Error en fetchUsuarioById:", error);
        return null;
    }
}

export async function crearUsuario(usuario: NuevoUsuario): Promise<Usuario | null> {
    try {
        const response = await api.post<Usuario>("/user/register", usuario);
        return response;
    } catch (error) {
        console.error("Error en crearUsuario:", error);
        return null;
    }
}

export async function actualizarUsuario(id: number, data: Partial<Usuario>): Promise<Usuario | null> {
    try {
        const response = await api.put<Usuario>(`/user/${id}`, data);
        return response;
    } catch (error) {
        console.error("Error en actualizarUsuario:", error);
        return null;
    }
}

export async function cambiarEstadoUsuario(id: number, activo: boolean): Promise<boolean> {
    try {
        await api.patch(`/user/${id}/estado`, { activo });
        return true;
    } catch (error) {
        console.error("Error en cambiarEstadoUsuario:", error);
        return false;
    }
}

export async function cambiarRolUsuario(id: number, rol: number): Promise<boolean> {
    try {
        await api.patch(`/user/${id}/rol`, { rol });
        return true;
    } catch (error) {
        console.error("Error en cambiarRolUsuario:", error);
        return false;
    }
}

export async function eliminarUsuario(id: number): Promise<boolean> {
    try {
        await api.delete(`/user/${id}`);
        return true;
    } catch (error) {
        console.error("Error en eliminarUsuario:", error);
        return false;
    }
}
