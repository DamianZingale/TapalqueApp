// components/Calendario.tsx
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { useState } from "react";

interface CalendarioProps {
    idHabitacion: string;
    fechasReservadas?: string[]; // "YYYY-MM-DD"
    onAgregarReserva?: (idHabitacion: string, start: Date, end: Date) => void;
}

export const Calendario = ({
    idHabitacion,
    fechasReservadas = [],
    onAgregarReserva,
}: CalendarioProps) => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const fechasBloqueadas = fechasReservadas.map((f) => new Date(f));

const handleClickAgregar = () => {
        if (!startDate || !endDate) {
        alert("Seleccioná un rango válido (inicio y fin).");
        return;
        }

        if (typeof onAgregarReserva !== "function") {
        // evita la excepción y ayuda a debuggear
        console.error("Calendario: onAgregarReserva no es una función", onAgregarReserva);
        alert("Error interno: callback de reserva no definido. Revisá el padre.");
        return;
        }

        onAgregarReserva(idHabitacion, startDate, endDate);
        setStartDate(null);
        setEndDate(null);
};

    return (
        <div className="p-4 bg-white rounded shadow text-center">
        <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(dates) => {
            const [start, end] = dates as [Date | null, Date | null];
            setStartDate(start);
            setEndDate(end);
            }}
            dayClassName={(date) => {
            const isReserved = fechasBloqueadas.some(
                (d) => d.toDateString() === date.toDateString()
            );
            if (isReserved) return "bg-red-500 text-white rounded-full";
            return "";
            }}
            inline
            locale={es}
        />

        <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleClickAgregar}
        >
            Agregar reserva
        </button>
        </div>
    );
};
