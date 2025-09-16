import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { useNavigate, useParams } from "react-router-dom";

const fechasDisponibles = [
    //Aca hay que ir a buscar al backend fechas disponibles del hospedaje
    new Date(2025, 8, 2),  // 8 = septiembre (mes empieza en 0)
    new Date(2025, 8, 5),
    new Date(2025, 8, 9),
    new Date(2025, 8, 14),
    new Date(2025, 8, 18),
    new Date(2025, 8, 21),
    new Date(2025, 8, 25),
];

export const Calendario = () => {
    const { id } = useParams(); // ID del hospedaje
    const navigate = useNavigate();

    const handleChange = (date: Date | null) => {
        if (!date) return; // si el usuario borra la fecha
        const esDisponible = fechasDisponibles.some(
            (d) => d.toDateString() === date.toDateString()
        );

        if (!esDisponible) {
            alert("No hay disponibilidad para la fecha seleccionada.");
            return;
        }
        const iso = date.toISOString().split("T")[0];
        navigate("/hospedaje/opciones", {
            state: {
                id: id,
                fecha: iso
            }
        });
    };

    return (
        <div className="p-4 bg-light rounded text-center">
            <DatePicker
                onChange={handleChange}
                dayClassName={(date) =>
                    fechasDisponibles.some((d) => d.toDateString() === date.toDateString())
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