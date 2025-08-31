import { useParams } from "react-router-dom";

export default function ServiciosDetailPage() {
    const { id } = useParams();
    return <h1>Detalle del servicio {id}</h1>;
}