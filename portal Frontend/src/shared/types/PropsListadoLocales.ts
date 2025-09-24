export interface PropsListadoLocales {
    id: string;
    estado: string;
    nombre: string;
    direccion: string;
    onSelect?: (id: string) => void;
    selectedId?: string | null;
}