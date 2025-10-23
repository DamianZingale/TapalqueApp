export interface Habitacion {
    id: string;
    nombre: string;
    tipo: string;
    camas: string;
    capacidad: number;
}

export interface Hospedaje {
    id: string;
    nombre: string;
    estado: string;
    habitaciones: Habitacion[];
    }
