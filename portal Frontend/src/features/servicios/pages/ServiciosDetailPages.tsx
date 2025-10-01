import { useParams } from "react-router-dom";
import { serviciosMock } from './mocks/mockServicios';
import { Horarios } from "../../../shared/components/Horarios";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { Carrusel } from "../../../shared/components/Carrusel";
import { Description } from "../../../shared/components/Description";
import { Title } from "../../../shared/components/Title";
import { SocialLinks } from "../../../shared/components/SocialLinks";

export default function ServiciosDetailPage() {
    const { id } = useParams();
    const data = serviciosMock.find((s) => s.id === id);

    if (!data) return <p>Servicio no encontrado</p>;

    return (
        <div className="container">
        <Title text={data.titulo} />
        <Carrusel images={data.imagenes} />
        <SocialLinks 
                    facebook={data.facebook}
                    instagram={data.instagram}
                    twitter={data.twitter}
                    tiktok={data.tiktok}/>

        <Description description={data.descripcion} />
        <Horarios horarios={data.horarios} />
        <WhatsAppButton num={data.num} />
        </div>
    );
}