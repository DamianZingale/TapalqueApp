// pages/HospedajeReservas.tsx
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { mockHospedajes } from "../mock/MockHospedajeEdit";
import { Calendario } from "../../hospedaje/components/Calendario"; // ajustá ruta

// Helper que convierte rango a array de strings "YYYY-MM-DD"
const expandRange = (start: Date, end: Date) => {
    const out: string[] = [];
    const cur = new Date(start);
    cur.setHours(0,0,0,0);
    const last = new Date(end);
    last.setHours(0,0,0,0);
    while (cur <= last) {
        out.push(cur.toISOString().split("T")[0]);
        cur.setDate(cur.getDate() + 1);
    }
    return out;
};

export const HospedajeReservas = () => {
    const { id } = useParams<{ id: string }>();
    const hospedaje = mockHospedajes.find((h) => h.id === id);

    // copia local en state (mock en memoria)
    const [opciones, setOpciones] = useState(hospedaje?.opciones ?? []);

    useEffect(() => {
        // si se cambia el id recargamos las opciones del mock
        setOpciones(hospedaje?.opciones ?? []);
    }, [id, hospedaje]);

    // handler que se pasa al Calendario
    const handleAgregarReserva = (idHabitacion: string, start: Date, end: Date) => {
        const nuevasFechas = expandRange(start, end);

        setOpciones((prev) =>
        prev.map((op) => {
            if (op.id !== idHabitacion) return op;

            // comprobar conflicto (alguna fecha ya reservada)
            const conflicto = nuevasFechas.some((f) => op.reservas.includes(f));
            if (conflicto) {
            alert("Algunas fechas del rango ya están reservadas para esta habitación.");
            return op;
            }

            return { ...op, reservas: [...op.reservas, ...nuevasFechas].sort() };
        })
        );
    };

    if (!hospedaje) return <div className="p-4">Hospedaje no encontrado</div>;

    return (
        <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Reservas de {hospedaje.nombre}</h1>

        <div className="grid gap-6">
            {opciones.map((op) => (
            <section key={op.id} className="border rounded p-4 bg-white">
                <h2 className="text-xl font-semibold">{op.titulo}</h2>
                <p>Capacidad: {op.maxPersonas}</p>
                <p>Stock: {op.cantidad}</p>

                
                <Calendario
                idHabitacion={op.id}
                fechasReservadas={op.reservas}
                onAgregarReserva={handleAgregarReserva}
                />

                {op.reservas.map((r) => (
        <li key={r} className="flex justify-between items-center gap-2">
            <span>{r}</span>

            <button
            className="text-blue-600 hover:underline text-sm"
            onClick={() => {
                const nuevaFecha = prompt(`Editar fecha ${r}`, r);
                if (!nuevaFecha || nuevaFecha === r) return;

                // validación básica
                if (op.reservas.includes(nuevaFecha)) {
                alert("⚠️ Esa fecha ya está reservada.");
                return;
                }

                setOpciones((prev) =>
                prev.map((opcion) =>
                    opcion.id === op.id
                    ? {
                        ...opcion,
                        reservas: opcion.reservas
                            .map((f) => (f === r ? nuevaFecha : f))
                            .sort(),
                        }
                    : opcion
                )
                );
            }}
            >
            Editar
            </button>

            <button
            className="text-red-600 hover:underline text-sm"
            onClick={() => {
                setOpciones((prev) =>
                prev.map((opcion) =>
                    opcion.id === op.id
                    ? {
                        ...opcion,
                        reservas: opcion.reservas.filter((fecha) => fecha !== r),
                        }
                    : opcion
                )
                );
            }}
            >
            Eliminar
            </button>
        </li>
))}

                <div className="mt-3">
                <strong>Reservas actuales:</strong>
                <ul className="mt-2">
                    {op.reservas.map((r) => (
                    <li key={r}>{r}</li>
                    ))}
                </ul>
                </div>
            </section>
            ))}
        </div>
        </div>
    );
};
