import { useParams } from "react-router-dom";
import { termasMock } from "./mocks/mockTermas";
import { Carrusel } from "../../../shared/components/Carrusel";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { SocialLinks } from "../../../shared/components/SocialLinks";

export default function TermasDetailPage({ idDefault }: { idDefault?: string }) {
    const { id } = useParams();
    const data = termasMock.find((t) => t.id === (id ?? idDefault));

    if (!data) return <p>Termas no encontradas</p>;

    return (
        <div className="container my-4">
        <h1 className="text-center mb-3">{data.titulo}</h1>

        {/* Carrusel de imágenes */}
        <Carrusel images = {data.imagenes}></Carrusel>

        <SocialLinks
            facebook={data.facebook}
            instagram={data.instagram}
            twitter={data.twitter}
            tiktok={data.tiktok}
        ></SocialLinks>

        {/* Descripción */}
        <p className="lead text-center">{data.descripcion}</p>

        {/* Horarios */}
        <div className="text-center my-3">
            <strong>Horarios:</strong> {data.horarios}
        </div>
                {/* Botón Web oficial */}
        {data.urlWeb && (
        <div className="text-center my-2">
            <a
            href={data.urlWeb}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            >
            Ir a la web de Termas
            </a>
        </div>
        )}
        
        {/* Botón Cómo Llegar */}
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

        {/* Servicios */}
        <div className="my-3">
            <h5>Servicios disponibles:</h5>
            <ul>
            {data.servicios.map((serv, idx) => (
                <li key={idx}>{serv}</li>
            ))}
            </ul>
        </div>



        {/* BTN whatsap */}
        <WhatsAppButton num={data.num}></WhatsAppButton>
        </div>
    );
}
