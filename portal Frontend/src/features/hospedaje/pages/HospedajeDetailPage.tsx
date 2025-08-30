import { useParams } from "react-router-dom";

export default function HospedajeDetailPage() {
    const { id } = useParams();
    return <h1>Detalle del hospedaje {id}</h1>;
}