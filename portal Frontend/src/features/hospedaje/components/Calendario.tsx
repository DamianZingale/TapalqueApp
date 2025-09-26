import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface CalendarioProps {
    idHospedaje?: string;
    fechasReservadas?: string[];
    modoAdmin?: boolean;
}

export const Calendario = ({
    idHospedaje,
    fechasReservadas = [],
    modoAdmin = false
}: CalendarioProps) => {
    const navigate = useNavigate();
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    const fechasBloqueadas = fechasReservadas.map((f) => new Date(f));

    const toggleDate = (date: Date | null) => {
        if (!date) return;

        const isReserved = fechasBloqueadas.some(
        (d) => d.toDateString() === date.toDateString()
        );
        if (isReserved) return;

        const alreadySelected = selectedDates.some(
        (d) => d.toDateString() === date.toDateString()
        );

        if (alreadySelected) {
        setSelectedDates(selectedDates.filter(
            (d) => d.toDateString() !== date.toDateString()
        ));
        } else {
        setSelectedDates([...selectedDates, date]);
        }
    };

    const handleReservar = () => {
        const fechasISO = selectedDates.map((d) =>
        d.toISOString().split("T")[0]
        );
        navigate("/hospedaje/opciones", {
        state: {
            id: idHospedaje,
            fechas: fechasISO
        }
        });
    };

    return (
        <div className="p-4 bg-white rounded shadow text-center">
        <DatePicker
            onChange={toggleDate}
            dayClassName={(date) => {
            const isReserved = fechasBloqueadas.some(
                (d) => d.toDateString() === date.toDateString()
            );
            const isSelected = selectedDates.some(
                (d) => d.toDateString() === date.toDateString()
            );
            if (isReserved) return "bg-red-500 text-white rounded-full";
            if (isSelected) return "bg-blue-500 text-white rounded-full";
            return "";
            }}
            inline
            locale={es}
        />

        {!modoAdmin && selectedDates.length > 0 && (
            <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleReservar}
            >
            Reservar
            </button>
        )}

        {modoAdmin && (
            <p className="mt-2 text-sm text-gray-600">
            Fechas bloqueadas para habitación <strong>{idHospedaje}</strong>
            </p>
        )}
        </div>
    );
};