export interface EventoDTO {
    id_evento: number;
    nombre_evento: string;
    fecha: string; // formato YYYY-MM-DD
    hora: string;  // formato HH:mm
    lugar: string;
    image: string;
    descripcion: string;
    telefono: string;
}