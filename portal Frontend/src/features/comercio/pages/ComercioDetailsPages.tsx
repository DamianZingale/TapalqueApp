import { useParams } from "react-router-dom";

export default function ComercioDetailPage() {
    const { id } = useParams();
    return <h1>Detalle del Comercio {id}</h1>;
}