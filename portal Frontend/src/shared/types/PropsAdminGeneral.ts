export interface PropsListadoLocalesUsuarios {
    id: string;
    estado: string;
    nombre: string;
    direccionOtipo: string; //direccion para locales y tipo para usuarios
    onSelect?: (id: string) => void;
    selectedId?: string | null;
}

export interface BotonesAccionProps {
    id: string;
    estado: string;
}