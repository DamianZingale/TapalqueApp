import { useParams } from "react-router-dom";
import { Title } from "../../../shared/components/Title";
import { Carrusel } from "../../../shared/components/Carrusel";
import { Description } from "../../../shared/components/Description";
import { Horarios } from "../../../shared/components/Horarios";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { comerciosMock } from './mocks/mockComercios';
import {SocialLinks} from "../../../shared/components/SocialLinks"

export default function ComercioDetailPage() {
    const { id } = useParams();
    const data = comerciosMock.find((comercio) => comercio.id === id);

    if (!data) return <p>Comercio no encontrado</p>;

    return (
        <div className="container">
        <Title text={data.titulo} />
        <Carrusel images={data.imagenes} />

         {/* Redes sociales */}
        <SocialLinks
        facebook={data.facebook}
        instagram={data.instagram}
        twitter={data.twitter}
        tiktok={data.tiktok}
        />
        <div className="text-center my-4">
        <a
            href={data.urlMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-[11rem] h-[2rem] bg-black text-white rounded-3xl text-[1rem] cursor-pointer flex justify-center items-center transition-all duration-300 hover:bg-[#333]"
        >
            Cómo Llegar
        </a>
        </div>

        

        <Description description={data.descripcion} />
        <Horarios horarios={data.horarios} />
                {/* Botón Cómo Llegar */}
        
        <WhatsAppButton num={data.num} />
        <div className="text-center my-3">
</div>

        </div>
    );
}