import { useParams } from "react-router-dom";
import { Calendario } from "../components/Calendario";
import { Title } from "../../../shared/components/Title";
import { Carrusel } from "../../../shared/components/Carrusel";
import { Description } from "../../../shared/components/Description";
import { Horarios } from "../../../shared/components/Horarios";
import { GMaps } from "../../../shared/components/GMaps";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { Subtitle } from "../../../shared/components/Subtitle";

export default function HospedajeDetailPage() {
    const { id } = useParams();
    const data = {
        //Aca ir a buscar al backend datos para mostrar desp del hospedaje
        nombre: "Hotel Tapalqué Cooperativo",
        imagenes: [
            "https://termastapalque.com.ar/wp-content/uploads/2023/08/Hotel-0.webp",
            "https://www.tiempoar.com.ar/wp-content/uploads/2023/03/WEB-2hotel-tapalque-1.jpg"
        ],
        descripcion: "Hotel centrico con wifi y desayuno gratis",
        urlMaps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25705.23026079333!2d-60.0246847048651!3d-36.357053790105866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9595ddc94f489d7b%3A0xb76799233bfd34e!2sHotel%20Tapalqu%C3%A9%20Cooperativo!5e0!3m2!1ses-419!2sar!4v1758036941552!5m2!1ses-419!2sar",
        horarios: "Todos los dias\nLas 24hs.",
        num: "2281683888"
    }


    return (
        <>
            <div className="container">
                <Title text={`${data.nombre} ${id}`} />
                <Carrusel images={data.imagenes} />
                <Description description={data.descripcion} />
                <Horarios horarios={data.horarios} />
                <WhatsAppButton num={data.num} />
                <Subtitle text="¡Reserva ahora!" />
                <Calendario />
                <GMaps url={data.urlMaps} />
            </div>
        </>
    )

}