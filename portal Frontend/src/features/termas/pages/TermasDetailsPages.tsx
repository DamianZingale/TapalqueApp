import { useParams } from "react-router-dom";

export default function TermasDetailPage() {
    const { id } = useParams();
    return <h1>Detalle de termas {id}</h1>;
}