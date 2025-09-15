import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";

const fechasDisponibles = [
    new Date(2025, 8, 2),  // 8 = septiembre (mes empieza en 0)
    new Date(2025, 8, 5),
    new Date(2025, 8, 9),
    new Date(2025, 8, 14),
    new Date(2025, 8, 18),
    new Date(2025, 8, 21),
    new Date(2025, 8, 25),
];

export const Calendario = () => {

    const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
    return (
        <div className="p-4 bg-light rounded text-center">
            <DatePicker
                selected={fechaSeleccionada}
                onChange={(date) => setFechaSeleccionada(date)}
                dayClassName={(date) =>
                    fechasDisponibles.some(
                        (d) => d.toDateString() === date.toDateString()
                    )
                        ? "bg-success text-white rounded-circle"
                        : ""
                }
                inline
                locale={es}
            />
        </div>
    );
};

//hice npm install react-datepicker