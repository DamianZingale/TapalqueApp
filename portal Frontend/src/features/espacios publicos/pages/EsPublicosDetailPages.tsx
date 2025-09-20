import { useParams } from "react-router-dom";
import { espaciosMock } from "./mocks/espaciosMock";
import { Carrusel } from "../../../shared/components/Carrusel";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { SocialLinks } from "../../../shared/components/SocialLinks";

export default function EspaciosDetailPage() {
    const { id } = useParams();
    const data = espaciosMock.find((e) => e.id === id);

    if (!data) return <p>Espacio no encontrado</p>;

    return (
        <div className="container my-4">
        <h1 className="text-center mb-3">{data.titulo}</h1>

        {/* Carrusel de imágenes */}
        <Carrusel images = {data.imagenes}></Carrusel>
                <a
            href={data.urlMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-[11rem] h-[2rem] bg-black text-white rounded-3xl text-[1rem] cursor-pointer flex justify-center items-center transition-all duration-300 hover:bg-[#333]"
        >
            Cómo Llegar
        </a>

        {/* Redes sociales */}
        <SocialLinks
        facebook={data.facebook}
        instagram={data.instagram}
        twitter={data.twitter}
        tiktok={data.tiktok}
        />

        {/* Descripción */}
        <p className="lead text-center">{data.descripcion}</p>

        {/* Dirección */}
        <div className="text-center my-3">
            <strong>Dirección:</strong> {data.direccion}
        </div>

        
        {/* Btn whatsapp*/}      
        {data.tel && <WhatsAppButton num={data.tel} />}

        </div>
    );
}