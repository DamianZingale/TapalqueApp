import { useState } from "react"
import { useHoteles } from "../hooks/useHoteles"
import { useNavigate } from "react-router-dom"
import type { Hotel, Habitacion  } from "../types/tiposHotel"

export const HotelFormPage = () => {
    const { agregarHotel } = useHoteles()
    const navigate = useNavigate()

    const [nombre, setNombre] = useState("")
    const [estado, setEstado] = useState<"Activo" | "Inactivo">("Activo")
    const [habitaciones, setHabitaciones] = useState<Habitacion[]>([])
    const [nuevaHab, setNuevaHab] = useState<Habitacion>({
        id: "",
        numero: "",
        tipo: "",
        camas: "",
    })

    const handleAgregarHabitacion = () => {
        if (!nuevaHab.numero.trim()) return
        const nueva = { ...nuevaHab, id: Date.now().toString() }
        setHabitaciones([...habitaciones, nueva])
        setNuevaHab({ id: "", numero: "", tipo: "", camas: "" })
    }

    const handleGuardar = () => {
        const nuevoHotel: Hotel = {
        id: Date.now().toString(),
        nombre,
        estado,
        habitaciones,
        }
        agregarHotel(nuevoHotel)
        navigate("/admin/hospedajes")
    }

    return (
        <div className="container mt-4">
        <h2>Nuevo Hotel</h2>
        <input className="form-control mb-2" placeholder="Nombre del hotel" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <select className="form-control mb-3" value={estado} onChange={(e) => setEstado(e.target.value as "Activo" | "Inactivo")}>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
        </select>

        <h4>Agregar habitación</h4>
        <input className="form-control mb-2" placeholder="Número" value={nuevaHab.numero} onChange={(e) => setNuevaHab({ ...nuevaHab, numero: e.target.value })} />
        <input className="form-control mb-2" placeholder="Tipo (single, doble mat, etc)" value={nuevaHab.tipo} onChange={(e) => setNuevaHab({ ...nuevaHab, tipo: e.target.value })} />
        <input className="form-control mb-2" placeholder="Camas" value={nuevaHab.camas} onChange={(e) => setNuevaHab({ ...nuevaHab, camas: e.target.value })} />
        <button className="btn btn-primary mb-3" onClick={handleAgregarHabitacion}>Agregar habitación</button>

        <h5>Habitaciones cargadas</h5>
        {habitaciones.map((h) => (
            <div key={h.id} className="card mb-2 p-2">
            <strong>{h.numero}</strong> — {h.tipo} — {h.camas}
            </div>
        ))}

        <button className="btn btn-success mt-3" onClick={handleGuardar}>Guardar hotel</button>
        </div>
    )
}