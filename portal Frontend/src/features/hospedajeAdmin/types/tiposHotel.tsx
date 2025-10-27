export interface OpcionHabitacion {
    id: string
    titulo: string
    maxPersonas: number
    precio: number
    tipoPrecio: "por_habitacion" | "por_persona"
    reservas: string[]
    foto?: string[]
}

export interface Hospedaje {
    id: string
    nombre: string
    descripcion: string
    foto: string
    opciones: OpcionHabitacion[]
}