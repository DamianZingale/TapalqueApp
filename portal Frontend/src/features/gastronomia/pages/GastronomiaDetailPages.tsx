import { useParams } from "react-router-dom";

export default function GastronomiaDetailPage() {
    const { id } = useParams();
    return <h1>Detalle de la gastronomia {id}</h1>;
}