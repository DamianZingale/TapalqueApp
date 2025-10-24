export type Habitacion = {
    id: string
    numero: string
    tipo: string
    camas: string
}

export type Hotel = {
    id: string
    nombre: string
    estado: "Activo" | "Inactivo"
    habitaciones: Habitacion[]
}