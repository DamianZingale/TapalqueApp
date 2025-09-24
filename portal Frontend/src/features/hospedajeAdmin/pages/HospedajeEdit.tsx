import { useState } from "react";

interface OpcionHospedaje {
    id: string;
    maxPersonas: number;
    foto: string;
    titulo: number;
    precio: number;
    tipoPrecio: "por_habitacion" | "por_persona";
    cantidad: number;
}

export const HospedajeEdit = () => {
    const [opciones, setOpciones] = useState<OpcionHospedaje[]>([]);
    const [form, setForm] = useState<OpcionHospedaje>({
        id: "",
        maxPersonas: 1,       
        foto: "",
        titulo: 0,
        precio: 0,
        tipoPrecio: "por_habitacion",
        cantidad: 0,
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "titulo") {
        // Buscar un número en el texto
        const match = value.match(/\d+/);
        if (match) {
        const personasEnTitulo = parseInt(match[0], 10);
        if (personasEnTitulo > form.maxPersonas) {
            alert(`⚠️ Esta habitación es para ${form.maxPersonas} personas como máximo.`);
        }
        }
    }

    setForm({
        ...form,
        [name]: name === "maxPersonas" || name === "precio" || name === "cantidad"
        ? Number(value)
        : value,
    });
};

    const handleAdd = () => {
            if (!form.titulo || !form.precio || !form.cantidad) {
        alert("Por favor, completá todos los campos obligatorios");
        return;
    }

        setOpciones([...opciones, { ...form, id: Date.now().toString() }]);
        setForm({
        id: "",
        maxPersonas: 1,
        
        foto: "",
        titulo: 0,
        precio: 0,
        tipoPrecio: "por_habitacion",
        cantidad: 1,
        });
    };

    const handleDelete = (id: string) => {
        setOpciones(opciones.filter((op) => op.id !== id));
};



    return (
        <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Editar Hospedaje</h1>

        {/* Formulario */}
        <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-2">Nueva opción</h2>
            <div className="grid grid-cols-2 gap-4">
            
            <label htmlFor="">Tipo Habitacion:</label>
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
            <label htmlFor="Numerp de personas en Habitacion"></label>
            <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Numerp de personas en H"
                className="border p-2 rounded"
            />

            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setForm({ ...form, foto: reader.result as string }); // guarda la imagen como Base64
                    };
                    reader.readAsDataURL(file);
                    }
                }}
                className="border p-2 rounded"
            />

            

            <label htmlFor="">Precio</label>
            <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                placeholder="Precio"
                className="border p-2 rounded"
            />

            <select
                name="tipoPrecio"
                value={form.tipoPrecio}
                onChange={handleChange}
                className="border p-2 rounded"
            >
                <option value="por_habitacion">Por habitación</option>
                <option value="por_persona">Por persona</option>
            </select>
                <label htmlFor="cantidad">Cant. Personas por habitación</label>
            <input
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                placeholder="Cantidad disponible"
                className="border p-2 rounded"
            />
            </div>
            
            <button
            onClick={handleAdd}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
            Agregar opción
            </button>
        </div>

        {/* Listado de opciones */}
        <h2 className="text-xl font-semibold mb-2">Opciones creadas</h2>
        <ul className="space-y-2">
            {opciones.map((op) => (
            <li key={op.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                <p className="font-bold">{op.titulo}</p>
                <div className="flex items-center gap-4">
                {/* Mostrar foto si existe */}
                {op.foto && (
                <img
                    src={op.foto}
                    alt={op.titulo}
                    className="w-10 h-10 object-cover rounded"
                />
                )}
                </div>
                <p>Capacidad: {op.maxPersonas} personas</p>
                <p>Precio: ${op.precio} ({op.tipoPrecio})</p>
                <p>Cantidad: {op.cantidad}</p>
                </div>
                <button
                onClick={() => handleDelete(op.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
                >
                Eliminar
                </button>
            </li>
            ))}
        </ul>
        </div>
    );
};
