import { useParams } from "react-router-dom";
import { Title } from "../../../shared/components/Title";
import { Carrusel } from "../../../shared/components/Carrusel";
import { Description } from "../../../shared/components/Description";
import { GMaps } from "../../../shared/components/GMaps";
import { Horarios } from "../../../shared/components/Horarios";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";

export default function ComercioDetailPage() {
    const { id } = useParams();
    const data = {
        nombre: "Comercio General Prueba",
        imagenes: [
            "https://i.pinimg.com/originals/0e/b3/bb/0eb3bb977428d9433ca07741706e83ae.jpg",
            "https://st2.depositphotos.com/1003697/8297/i/450/depositphotos_82978822-stock-photo-supermarket-store-with-vegetables.jpg"
        ],
        descripcion: "Tapalqué es un lugar único.\nAquí podés disfrutar de la naturaleza,\nlos deportes y la tranquilidad.\n\nIdeal para escapadas de fin de semana.",
        urlMaps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d200.82788778722778!2d-60.025677620491216!3d-36.35481487873783!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9595dd3c51921f95%3A0xe615d6e6f38db6f9!2sMinimercado%20Yesi!5e0!3m2!1ses-419!2sar!4v1757358563713!5m2!1ses-419!2sar",
        horarios: "Lunes a Sabados\nde 08:00hs a 20:00hs.",
        num: "2281683888"
    }

    return (
        <div className="container">
            <Title text={`${data.nombre} ${id}`} />
            <Carrusel images={data.imagenes} />
            <Description description={data.descripcion}/>
            <Horarios horarios={data.horarios}/>
            <GMaps url={data.urlMaps}/>
            <WhatsAppButton num={data.num}/>
        </div>
    )
}