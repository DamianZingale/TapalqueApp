import { useParams } from "react-router-dom";
import { Title } from "../../../shared/components/Title";
import { Carrusel } from "../../../shared/components/Carrusel";

export default function ComercioDetailPage() {
    const { id } = useParams();
    const data = {
        nombre : "Comercio General Prueba",
        imagenes : [
            "https://i.pinimg.com/originals/0e/b3/bb/0eb3bb977428d9433ca07741706e83ae.jpg",
            "https://st2.depositphotos.com/1003697/8297/i/450/depositphotos_82978822-stock-photo-supermarket-store-with-vegetables.jpg"
        ]
    }
    return (
        <div className="container">
            <Title text={`${data.nombre} ${id}`}/>
            <Carrusel images={data.imagenes}/>
        </div>
    )
    ;
}