

export interface Hospedaje {
    id: string;
    nombre: string;
    descripcion: string;
    fotos: string[]; // fotos generales
    opciones: OpcionHospedaje[];
}

export interface OpcionHospedaje {
    id: string;
    titulo: string; // "Habitación doble", "Cabaña 4 personas"
    foto: string; // foto principal de esa opción
    maxPersonas: number;
    precio: number;
    tipoPrecio: "por_habitacion" | "por_persona"; // para calcular
    cantidad: number; // stock (ej: 4 habitaciones dobles)
    reservas: Reserva[]; // reservas ya hechas
}

export interface Reserva {
    id: string;
    fechaInicio: string; // "2025-09-23"
    fechaFin: string;    // "2025-09-25"
    cantidad: number;    // cuántas unidades de esta opción reservaron
}
