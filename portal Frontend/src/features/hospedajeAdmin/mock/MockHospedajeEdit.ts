export interface OpcionHabitacion {
    id: string;
    titulo: string;
    maxPersonas: number;
    precio: number;
    tipoPrecio: "por_habitacion" | "por_persona";
    cantidad: number;
    reservas: string[];
}
export interface Hospedaje {
    id: string;
    nombre: string;
    descripcion: string;
    foto: string;
    opciones: OpcionHabitacion[];
}


export const mockHospedajes: Hospedaje[] = [
    {
        id: "1",
        nombre: "Hotel Tapalqué",
        descripcion: "Hotel céntrico con pileta y desayuno incluido.",
        foto: "https://via.placeholder.com/200x120.png?text=Hotel+Tapalque",
        opciones: [
        {
            id: "101",
            titulo: "Doble",
            maxPersonas: 2,
            precio: 22000,
            tipoPrecio: "por_habitacion",
            cantidad: 5,
            reservas: ["2025-09-28", "2025-10-20"]
        },
        {
            id: "102",
            titulo: "Triple",
            maxPersonas: 3,
            precio: 28000,
            tipoPrecio: "por_habitacion",
            cantidad: 5,
            reservas: ["2025-10-22", "2025-10-26"]
        }
        ]
    },
    {
        id: "2",
        nombre: "Cabañas El Río",
        descripcion: "Cabañas equipadas frente al río, ideales para familia.",
        foto: "https://via.placeholder.com/200x120.png?text=Cabanas+El+Rio",
        opciones: [
        {
            id: "201",
            titulo: "Familiar",
            maxPersonas: 6,
            precio: 30000,
            tipoPrecio: "por_persona",
            cantidad: 3,
            reservas: []
        }
        ]
    },
    {
        id: "3",
        nombre: "Posada La Plaza",
        descripcion: "Posada boutique en la plaza central.",
        foto: "https://via.placeholder.com/200x120.png?text=Posada+La+Plaza",
        opciones: [
        {
            id: "301",
            titulo: "Suite",
            maxPersonas: 2,
            precio: 18000,
            tipoPrecio: "por_habitacion",
            cantidad: 2,
            reservas: []
        }
        ]
    }
];