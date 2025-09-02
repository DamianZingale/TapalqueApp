import { type SECCION_TYPE } from "../constants/constSecciones";

export interface CardProps {
    id: string;
    titulo: string;
    imagenUrl: string;
    tipo: typeof SECCION_TYPE[keyof typeof SECCION_TYPE];
    direccion_local: string;
}
