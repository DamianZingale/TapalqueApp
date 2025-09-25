import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Listado } from '../../../shared/components/Listado';

export const HospedajeListsOptions = () => {
    const location = useLocation();
    const { id, fechas } = location.state || {};
    const [opciones, setOpciones] = useState<any[]>([]);

useEffect(() => {
    const fetchOpciones = async () => {
        try {
        const res = await fetch(`http://localhost:3000/api/hospedajes/${id}/opciones`);
        const data = await res.json();
        setOpciones(data);
        } catch (err) {
        console.error("Error cargando opciones", err);
        }
    };

    if (id) fetchOpciones();
}, [id, fechas]);

const navigate = useNavigate();


    const handleReservar = (idOpcion: string) => {
        navigate("/hospedaje/confirmar", {
            state: {
                id: id ,
                idOpcion: idOpcion,
                fecha:fechas
            }
        });
    };
    return (
        <div className="p-4">
            <h3>Reserva para el hospedaje {id}</h3>
            <p>Fecha seleccionada: {fechas}</p>
            {
                opciones.map((opcion) => (
                    <Listado
                        key={opcion.id}
                        id={opcion.id}
                        encabezado={opcion.encabezado}
                        titulo={opcion.titulo}
                        pie={opcion.pie}
                        textButton='Reservar'
                        handleButton={handleReservar}
                    />
                ))
            }
        </div>
    )
}
