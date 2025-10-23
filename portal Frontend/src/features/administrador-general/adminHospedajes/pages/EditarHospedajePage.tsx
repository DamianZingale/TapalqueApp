import { useParams } from "react-router-dom";
import { useState } from "react";
import { mockHospedajes } from "../mocks/mockHospedajes";
import type { Hospedaje, Habitacion } from "../types/typesHospedaje";

export const EditarHospedajePage = () => {
    const { id } = useParams<{ id: string }>();
    const hospedajeEncontrado = mockHospedajes.find((h) => h.id === id);

    const [hospedaje, setHospedaje] = useState<Hospedaje | undefined>(hospedajeEncontrado);
    const [nuevaHab, setNuevaHab] = useState<Habitacion>({
        id: "",
        nombre: "",
        tipo: "",
        camas: "",
        capacidad: 1,
    });

    if (!hospedaje) return <p>Hospedaje no encontrado</p>;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNuevaHab({ ...nuevaHab, [e.target.name]: e.target.value });
    };

    const handleAgregarHabitacion = () => {
        if (!nuevaHab.nombre.trim()) return alert("Completa los datos de la habitación");
        const nueva = { ...nuevaHab, id: Date.now().toString() };
        setHospedaje({
        ...hospedaje,
        habitaciones: [...hospedaje.habitaciones, nueva],
        });
        setNuevaHab({ id: "", nombre: "", tipo: "", camas: "", capacidad: 1 });
    };

    return (
        <div className="container mt-4">
        <h2>Editar Hospedaje: {hospedaje.nombre}</h2>

        <div className="card p-3 mb-4">
            <h4>Agregar nueva habitación</h4>
            <input
            name="nombre"
            placeholder="Ej: Hab. 101 doble mat."
            className="form-control mb-2"
            value={nuevaHab.nombre}
            onChange={handleChange}
            />
            <input
            name="tipo"
            placeholder="Ej: doble, single, triple"
            className="form-control mb-2"
            value={nuevaHab.tipo}
            onChange={handleChange}
            />
            <input
            name="camas"
            placeholder="Ej: matrimonial, twin, mat+twin"
            className="form-control mb-2"
            value={nuevaHab.camas}
            onChange={handleChange}
            />
            <input
            name="capacidad"
            type="number"
            placeholder="Capacidad"
            className="form-control mb-2"
            value={nuevaHab.capacidad}
            onChange={handleChange}
            />
            <button onClick={handleAgregarHabitacion} className="btn btn-primary">
            Agregar habitación
            </button>
        </div>

        <h4>Habitaciones existentes</h4>
        {hospedaje.habitaciones.length === 0 && <p>No hay habitaciones registradas.</p>}
        {hospedaje.habitaciones.map((hab) => (
            <div key={hab.id} className="card mb-2 p-2">
            <strong>{hab.nombre}</strong> — {hab.tipo} — {hab.camas} — {hab.capacidad} pax
            </div>
        ))}
        </div>
    );
};
