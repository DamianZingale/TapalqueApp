import { jwtDecode } from "jwt-decode";
import type { PropsPayload } from "../types/PropsAuth";

export const getRolUsuario = (): number | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const payload = jwtDecode<PropsPayload>(token);
        return payload.rol;
    } catch {
        return null;
    }
};

//instale npm install jwt-decode