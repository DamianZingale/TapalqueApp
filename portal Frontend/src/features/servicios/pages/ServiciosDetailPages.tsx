import { useParams } from "react-router-dom";
import { serviciosMock } from './mocks/mockServicios';
import { GMaps } from "../../../shared/components/GMaps";
import { Horarios } from "../../../shared/components/Horarios";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { Carrusel } from "../../../shared/components/Carrusel";
import { Description } from "../../../shared/components/Description";
import { Title } from "../../../shared/components/Title";

export default function ServiciosDetailPage() {
    const { id } = useParams();
    const data = serviciosMock.find((s) => s.id === id);

    if (!data) return <p>Servicio no encontrado</p>;

    return (
        <div className="container">
        <Title text={data.titulo} />
        <Carrusel images={data.imagenes} />
        <Description description={data.descripcion} />
        <Horarios horarios={data.horarios} />
        <GMaps url={data.urlMaps} />
        <WhatsAppButton num={data.num} />
        </div>
    );
}