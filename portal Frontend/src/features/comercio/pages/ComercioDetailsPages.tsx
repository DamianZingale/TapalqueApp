import { useParams } from "react-router-dom";
import { Title } from "../../../shared/components/Title";
import { Carrusel } from "../../../shared/components/Carrusel";
import { Description } from "../../../shared/components/Description";
import { GMaps } from "../../../shared/components/GMaps";
import { Horarios } from "../../../shared/components/Horarios";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { comerciosMock } from './mocks/mockComercios';

export default function ComercioDetailPage() {
    const { id } = useParams();
    const data = comerciosMock.find((comercio) => comercio.id === id);

    if (!data) return <p>Comercio no encontrado</p>;

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