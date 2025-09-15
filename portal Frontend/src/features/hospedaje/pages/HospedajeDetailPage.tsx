import { useParams } from "react-router-dom";
import { Calendario } from "../components/calendario";
import { Title } from "../../../shared/components/Title";

export default function HospedajeDetailPage() {
    const { id } = useParams();
    return (
        <>
            <Title text={`Detalle del hospedaje ${id}`} />
            <Calendario />
        </>
    )

}