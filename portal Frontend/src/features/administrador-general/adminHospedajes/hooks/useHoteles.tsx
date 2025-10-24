import { useState } from "react"
import type { Hotel } from "../types/tiposHotel"

export const useHoteles = () => {
    const [hoteles, setHoteles] = useState<Hotel[]>([])

    const agregarHotel = (hotel: Hotel) => {
        setHoteles((prev) => [...prev, hotel])
    }

    const actualizarHotel = (hotelActualizado: Hotel) => {
        setHoteles((prev) =>
        prev.map((h) => (h.id === hotelActualizado.id ? hotelActualizado : h))
        )
    }

    const toggleEstado = (id: string) => {
        setHoteles((prev) =>
        prev.map((h) =>
            h.id === id
            ? { ...h, estado: h.estado === "Activo" ? "Inactivo" : "Activo" }
            : h
        )
        )
    }

    return { hoteles, agregarHotel, actualizarHotel, toggleEstado }
}