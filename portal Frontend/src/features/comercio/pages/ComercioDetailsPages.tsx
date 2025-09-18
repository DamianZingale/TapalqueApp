import { useParams } from "react-router-dom";
import { Title } from "../../../shared/components/Title";
import { Carrusel } from "../../../shared/components/Carrusel";
import { Description } from "../../../shared/components/Description";
import { GMaps } from "../../../shared/components/GMaps";
import { Horarios } from "../../../shared/components/Horarios";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { comerciosMock } from './mocks/mockComercios';
import { ButtonComoLlegar } from "../../../shared/components/ButtonComoLlegar";

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
        <ButtonComoLlegar
            destination={
            data.lat && data.lng
                ? { lat: String(data.lat), lng: String(data.lng) }
                : { lat: "0", lng: "0" }
            }
        />
        <GMaps url={data.urlMaps} />
        <WhatsAppButton num={data.num} />
        <div className="text-center my-3">
</div>

        </div>
    );
}