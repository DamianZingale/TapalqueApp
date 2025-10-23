import type { Hospedaje } from "../types/typesHospedaje";

export const mockHospedajes: Hospedaje[] = [
    {
        id: "1",
        nombre: "Hotel del Lago",
        estado: "Activo",
        habitaciones: [
        { id: "h1", nombre: "Suite 1", tipo: "Doble", camas: "2 simples", capacidad: 2 },
        { id: "h2", nombre: "Suite 2", tipo: "Triple", camas: "1 doble y 1 simple", capacidad: 3 },
        ],
    },
    {
        id: "2",
        nombre: "Posada del Sol",
        estado: "Inactivo",
        habitaciones: [
        { id: "h1", nombre: "Habitación Económica", tipo: "Simple", camas: "1 simple", capacidad: 1 },
        ],
    },
];
