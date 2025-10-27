import { useState } from "react"
import { useParams } from "react-router-dom"
import { mockHospedajes } from "../mock/MockHospedajeEdit"
import type { OpcionHabitacion } from "../types/tiposHotel"

// Tipo extendido para edición local
interface HabitacionEditable extends Omit<OpcionHabitacion, "foto"> {
    foto: string
    disponible: boolean
}

export const HospedajeEdit = () => {
    const { id } = useParams()
    const hospedaje = mockHospedajes.find((h) => h.id === id)

    const [opciones, setOpciones] = useState<HabitacionEditable[]>(
        hospedaje?.opciones.map((op) => ({
        ...op,
        foto: Array.isArray(op.foto) ? op.foto[0] : "",
        disponible: true
        })) || []
    )

    const handleUpdate = <K extends keyof HabitacionEditable>(
        index: number,
        key: K,
        value: HabitacionEditable[K]
    ) => {
        const nuevas = [...opciones]
        nuevas[index] = { ...nuevas[index], [key]: value }
        setOpciones(nuevas)
    }

    const handleDelete = (id: string) => {
        setOpciones(opciones.filter((op) => op.id !== id))
    }

    const handleGuardarCambios = () => {
        console.log("Habitaciones actualizadas:", opciones)
        alert("Cambios guardados correctamente ✅")
        // Ejemplo de persistencia local:
        localStorage.setItem(`habitaciones-${hospedaje?.id}`, JSON.stringify(opciones))
    }

    if (!hospedaje) return <p className="p-6">Hospedaje no encontrado</p>

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Editar: {hospedaje.nombre}</h1>
        <p className="mb-6 text-gray-600">{hospedaje.descripcion}</p>

        <h2 className="text-xl font-semibold mb-4">Habitaciones creadas</h2>
        <ul className="space-y-6">
        {opciones.map((op, index) => (
            <li key={op.id} className="bg-white p-4 rounded shadow">
                <div className="grid grid-cols-2 gap-4">
                <input
                    value={op.id}
                    disabled
                    className="border p-2 rounded"
                />

                <select
                    value={op.titulo}
                    onChange={(e) =>
                    handleUpdate(index, "titulo", e.target.value)
                    }
                    className="border p-2 rounded"
                >
                    <option value="Single">Single</option>
                    <option value="Doble mat">Doble mat</option>
                    <option value="Doble twin">Doble twin</option>
                    <option value="Triple mat + twin">Triple mat + twin</option>
                    <option value="Triple twin">Triple twin</option>
                    <option value="Cuádruple">Cuádruple</option>
                </select>

                <select
                    value={op.maxPersonas}
                    onChange={(e) =>
                    handleUpdate(index, "maxPersonas", Number(e.target.value))
                    }
                    className="border p-2 rounded"
                >
                    <option value={1}>Individual</option>
                    <option value={2}>Doble</option>
                    <option value={3}>Triple</option>
                    <option value={4}>Cuádruple</option>
                    <option value={5}>Quíntuple</option>
                </select>

                <input
                    type="number"
                    value={op.precio}
                    onChange={(e) =>
                    handleUpdate(index, "precio", Number(e.target.value))
                    }
                    className="border p-2 rounded"
                />

                <select
                    value={op.tipoPrecio}
                    onChange={(e) =>
                    handleUpdate(index, "tipoPrecio", e.target.value as HabitacionEditable["tipoPrecio"])
                    }
                    className="border p-2 rounded"
                >
                    <option value="por_habitacion">Por habitación</option>
                    <option value="por_persona">Por persona</option>
                </select>

                <label className="flex items-center gap-2">
                    <input
                    type="checkbox"
                    checked={op.disponible}
                    onChange={(e) =>
                        handleUpdate(index, "disponible", e.target.checked)
                    }
                    />
                    Disponible
                </label>
                </div>

                {op.foto && (
                <img
                    src={op.foto}
                    alt={op.titulo}
                    className="mt-4 w-32 h-20 object-cover rounded"
                />
                )}

                <button
                onClick={() => handleDelete(op.id)}
                className="mt-4 bg-red-500 text-white px-3 py-1 rounded"
                >
                Eliminar habitación
                </button>
            </li>
            ))}
        </ul>

        <button
            onClick={handleGuardarCambios}
            className="mt-6 bg-green-600 text-white px-4 py-2 rounded"
        >
            Guardar cambios
        </button>
        </div>
    )
}