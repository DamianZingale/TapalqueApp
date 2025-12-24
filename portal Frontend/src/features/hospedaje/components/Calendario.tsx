import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

const fechasDisponibles = [
    //Aca hay que ir a buscar al backend fechas disponibles del hospedaje
    new Date(2025, 8, 19),  // 8 = septiembre (mes empieza en 0)
    new Date(2025, 8, 20),
    new Date(2025, 8, 21),
];

export const Calendario = () => {
    const { id } = useParams(); // ID del hospedaje
    const navigate = useNavigate();
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    const toggleDate = (date: Date | null) => {
        if (!date) return;

        const isAvailable = fechasDisponibles.some(
            (d) => d.toDateString() === date.toDateString()
        );
        if (!isAvailable) return;

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
                id,
                fechas: fechasISO
            }
        });
    };


    return (
        <div className="p-2 bg-light rounded text-center">
            <DatePicker
                onChange={toggleDate}
                dayClassName={(date) => {
                    const isAvailable = fechasDisponibles.some(
                        (d) => d.toDateString() === date.toDateString()
                    );
                    const isSelected = selectedDates.some(
                        (d) => d.toDateString() === date.toDateString()
                    );
                    if (isAvailable && isSelected) return "bg-primary text-white rounded-circle";
                    if (isAvailable) return "bg-success text-white rounded-circle";
                    return "";
                }}
                inline
                locale={es}
            />
            {selectedDates.length > 0 && (
                <div className="d-flex justify-content-center mt-3">
                    <button
                        className="btn btn-secondary mt-3 "
                        onClick={handleReservar}
                    >
                        Reservar 
                    </button>
                </div>
            )}
        </div>
    );
}
//hice npm install react-datepicker