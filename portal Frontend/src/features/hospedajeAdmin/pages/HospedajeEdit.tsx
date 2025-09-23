import { useState } from "react"

export const HospedajeEdit = () =>{
    const [habitaciones, setHabitaciones] = useState(1)
    const [camas, setCamas] = useState([1])

    const habitacionesChange = (e) =>{
        const cantidad = parseInt(e.target.value)
        setHabitaciones(cantidad)

        // Ajustar el array de camas según la cantidad de habitaciones
        const nuevasCamas = Array.from({ length: cantidad }, (_, i) => camas[i] || 1);
        setCamas(nuevasCamas);
    }

    const camasChange = (index, value) => {
    const nuevasCamas = [...camas];
    nuevasCamas[index] = parseInt(value);
    setCamas(nuevasCamas);
    };

    
    return (
        <div className="">
        <h1 className="">Editar hospedaje</h1>
        <form className="">
            <label className="">Nombre del Hotel/Hospedaje/Cabañas</label>
            <input
            type="text"
            placeholder=""
            defaultValue=""
            className=""
            />

            <label className="">Cantidad de habitaciones</label>
            <input
            type="number"
            min="1"
            value={habitaciones}
            onChange={habitacionesChange}
            className=""
            />

            <section className="">
            <h2 className="">Camas por habitación</h2>
            {camas.map((camas, index) => (
                <div key={index} className="">
                <label className="">Habitación {index + 1}:</label>
                <input
                    type="number"
                    min="1"
                    value={camas}
                    onChange={(e) => camasChange(index, e.target.value)}
                    className=""
                />
                </div>
            ))}
            </section>
            <label htmlFor="">Usted cobra por</label>
            <input type="radio" value="Persona" />
            <input type="radio" value="Habitacion" />
        </form>
        </div>
    );

}