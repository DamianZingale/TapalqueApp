import { useParams } from "react-router-dom";

export default function EsPublicosDetailPage() {
    const { id } = useParams();
    return <h1>Detalle del espacio publico{id}</h1>;
}