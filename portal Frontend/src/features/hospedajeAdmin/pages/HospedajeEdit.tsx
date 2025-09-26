import { useState } from "react";
import { useParams } from "react-router-dom";
import { Calendario } from "../../hospedaje/components/Calendario";
import { mockHospedajes } from "../mock/MockHospedajeEdit";

interface OpcionHabitacion {
    id: string;
    titulo: string;
    maxPersonas: number;
    precio: number;
    tipoPrecio: "por_habitacion" | "por_persona";
    cantidad: number;
    reservas: string[];
    foto: string;
}

export const HospedajeEdit = () => {
    const { id } = useParams();
    const hospedaje = mockHospedajes.find((h) => h.id === id);

    const [opciones, setOpciones] = useState<OpcionHabitacion[]>(hospedaje?.opciones || []);
    const [form, setForm] = useState<OpcionHabitacion>({
        id: "",
        titulo: "",
        maxPersonas: 1,
        precio: 0,
        tipoPrecio: "por_habitacion",
        cantidad: 1,
        reservas: [],
        foto: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const key = name === "nHab" ? "id" : name;

        setForm({
    ...form,
    [key]: key === "maxPersonas" || key === "precio" || key === "cantidad"
        ? Number(value)
        : value,
    });

    };

    const handleAdd = () => {
        if (!form.titulo || !form.precio || !form.cantidad) {
        alert("Por favor, completá todos los campos obligatorios");
        return;
        }

        setOpciones([...opciones, { ...form }]);

        setForm({
        id: "",
        titulo: "",
        maxPersonas: 1,
        precio: 0,
        tipoPrecio: "por_habitacion",
        cantidad: 1,
        reservas: [],
        foto: ""
        });
    };

    const handleDelete = (id: string) => {
        setOpciones(opciones.filter((op) => op.id !== id));
    };

    if (!hospedaje) return <p className="p-6">Hospedaje no encontrado</p>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Editar: {hospedaje.nombre}</h1>
        <p className="mb-6 text-gray-600">{hospedaje.descripcion}</p>

        {/* Formulario */}
        <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-2">Agregar habitación</h2>
            <div className="grid grid-cols-2 gap-4">
                <label>N de Habitacion</label>
            <input
                name="nHab"
                value={form.id}
                onChange={handleChange}
                placeholder="Ej. 105"
                className="border p-2 rounded"
            />
            <label>Título</label>
            <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ej: Doble, Triple..."
                className="border p-2 rounded"
            />

            <label>Capacidad máxima</label>
            <select
                name="maxPersonas"
                value={form.maxPersonas}
                onChange={handleChange}
                className="border p-2 rounded"
            >
                <option value={1}>Individual</option>
                <option value={2}>Doble</option>
                <option value={3}>Triple</option>
                <option value={4}>Cuádruple</option>
                <option value={5}>Quíntuple</option>
            </select>

            <label>Foto</label>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                    setForm({ ...form, foto: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                }
                }}
                className="border p-2 rounded"
            />

            <label>Precio</label>
            <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                placeholder="Precio"
                className="border p-2 rounded"
            />

            <label>Tipo de precio</label>
            <select
                name="tipoPrecio"
                value={form.tipoPrecio}
                onChange={handleChange}
                className="border p-2 rounded"
            >
                <option value="por_habitacion">Por habitación</option>
                <option value="por_persona">Por persona</option>
            </select>

            <label>Cantidad disponible</label>
            <input
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                placeholder="Cantidad"
                className="border p-2 rounded"
            />
            </div>

            <button
            onClick={handleAdd}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
            Agregar habitación
            </button>
        </div>

        {/* Listado de habitaciones */}
        <h2 className="text-xl font-semibold mb-4">Habitaciones creadas</h2>
        <ul className="space-y-6">
            {opciones.map((op) => (
            <li key={op.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-center mb-2">
                <div>
                    <p className="font-bold text-lg">{op.titulo}</p>
                    <p>Capacidad: {op.maxPersonas} personas</p>
                    <p>Precio: ${op.precio} ({op.tipoPrecio})</p>
                    <p>Cantidad disponible: {op.cantidad}</p>
                </div>
                {op.foto && (
                    <img
                    src={op.foto}
                    alt={op.titulo}
                    className="w-20 h-12 object-cover rounded"
                    />
                )}
                </div>

                {/* Calendario por habitación */}
                <h3 className="text-md font-semibold mb-2">Calendario de disponibilidad</h3>
                <Calendario
                idHospedaje={op.id}
                fechasReservadas={op.reservas}
                modoAdmin={true}
                />

                <button
                onClick={() => handleDelete(op.id)}
                className="mt-4 bg-red-500 text-white px-3 py-1 rounded"
                >
                Eliminar habitación
                </button>
            </li>
            ))}
        </ul>
        </div>
    );
    };