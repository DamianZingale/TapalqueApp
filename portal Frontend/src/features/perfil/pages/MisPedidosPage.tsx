import { Title } from "../../../shared/components/Title"
import { Listado } from "../../../shared/components/Listado"
import { useNavigate } from "react-router-dom";

const data = [{
    "id": "g1",
    "estado": "Entregado",
    "titulo": "Pedido en Parrilla El Fogón",
    "fecha": "2025-09-11T13:00:00"
},
{
    "id": "g2",
    "estado": "En preparación",
    "titulo": "Pedido en Pizzería Don Mateo",
    "fecha": "2025-09-11T20:15:00"
},
{
    "id": "g3",
    "estado": "Cancelado",
    "titulo": "Pedido en Heladería La Dulce",
    "fecha": "2025-09-10T16:30:00"
},
{
    "id": "g4",
    "estado": "Entregado",
    "titulo": "Pedido en Restaurante El Campo",
    "fecha": "2025-09-09T21:00:00"
},
{
    "id": "g5",
    "estado": "En preparación",
    "titulo": "Pedido en Café Central",
    "fecha": "2025-09-12T08:45:00"
},
{
    "id": "g6",
    "estado": "Entregado",
    "titulo": "Pedido en Panadería La Plaza",
    "fecha": "2025-09-13T10:30:00"
}
]

export const MisPedidosPage = () => {
    const navigate = useNavigate();

    const handleVerPedido = (id: string) => {
        navigate(`/opcion/${id}`); // o cualquier ruta que uses
    };

    return (
        <div className="container">
            <Title text="Mis Pedidos" />
            {data.map((data) => (
                <Listado
                    id={data.id}
                    encabezado={data.estado}
                    titulo={data.titulo}
                    pie={data.fecha}
                    textButton="Ver pedido"
                    handleButton={handleVerPedido}
                />
            ))}
        </div>
    )
}
