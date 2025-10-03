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


        // dentro de HospedajeReservas
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");

    // función auxiliar: expande rango en array YYYY-MM-DD
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

    return (
        <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Reservas de {hospedaje.nombre}</h1>

        {/*Habitacion disponible hoy? */}
        <button
            className="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => {
                const hoy = new Date().toISOString().split("T")[0]; 
                const disponibles = opciones.filter(
                (op) => !op.reservas.includes(hoy)
                );

                if (disponibles.length === 0) {
                alert("Hoy no hay habitaciones disponibles 😞");
                } else {
                const listado = disponibles.map((d) => `- [${d.id}] ${d.titulo}`).join("\n");
                alert(`Habitaciones disponibles hoy (${hoy}):\n${listado}`);
                }
            }}
            >
            Ver habitaciones disponibles hoy
        </button>

        {/* 🔽 UI para búsqueda de rango */}
        <div className="my-6 p-4 border rounded bg-gray-50">
        <h2 className="font-semibold mb-2">Buscar disponibilidad por rango</h2>
        <div className="flex gap-4 items-center">
            <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="border p-2 rounded"
            />
            <span>a</span>
            <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="border p-2 rounded"
            />

            <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => {
                if (!fechaDesde || !fechaHasta) {
                alert("⚠️ Debes seleccionar ambas fechas");
                return;
                }
                const rango = expandRange(new Date(fechaDesde), new Date(fechaHasta));

                const disponibles = opciones.filter(
                (op) => !op.reservas.some((r) => rango.includes(r))
                );

                if (disponibles.length === 0) {
                alert(`No hay habitaciones disponibles entre ${fechaDesde} y ${fechaHasta}`);
                } else {
                const listado = disponibles
                    .map((d) => `- [${d.id}] ${d.titulo}`)
                    .join("\n");
                alert(
                    `Habitaciones disponibles del ${fechaDesde} al ${fechaHasta}:\n${listado}`
                );
                }
            }}
            >
            Buscar
            </button>
        </div>
        </div>

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
