import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Listado } from '../../../shared/components/Listado';

export const HospedajeListsOptions = () => {
    const location = useLocation();
    const { id, fecha } = location.state || {};
    const [opciones, setOpciones] = useState<any[]>([]);

    useEffect(() => {
        // falta traer del back las opciones disponibles para ese dia
        //Aca puedo cambiar los los nombres de los json es indiferente importa abajo como se lo pasa al componente
        const data = [
            {
                id: "1",
                encabezado: "Suite",
                titulo: "Suite con vista al río",
                pie: "$18.000 por noche",
            },
            {
                id: "2",
                encabezado: "Doble",
                titulo: "Habitación doble con desayuno",
                pie: "$12.000 por noche",
            },
            {
                id: "3",
                encabezado: "Familiar",
                titulo: "Departamento completo para 4 personas",
                pie: "$22.000 por noche",
            },
        ];
        setOpciones(data);
    }, [id, fecha]);

    const navigate = useNavigate();

    const handleReservar = (idOpcion: string) => {
        navigate("/hospedaje/confirmar", {
            state: {
                id: id ,
                idOpcion: idOpcion,
                fecha:fecha
            }
        });
    };
    return (
        <div className="p-4">
            <h3>Reserva para el hospedaje {id}</h3>
            <p>Fecha seleccionada: {fecha}</p>
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
