import { useParams } from "react-router-dom";
import { espaciosMock } from "./mocks/espaciosMock";
import { ButtonComoLlegar } from "../../../shared/components/ButtonComoLlegar";

export default function EspaciosDetailPage() {
    const { id } = useParams();
    const data = espaciosMock.find((e) => e.id === id);

    if (!data) return <p>Espacio no encontrado</p>;

    return (
        <div className="container my-4">
        <h1 className="text-center mb-3">{data.titulo}</h1>

        {/* Carrusel de imágenes */}
        <div className="row justify-content-center mb-4">
            {data.imagenes.map((img, index) => (
            <div key={index} className="col-md-4 mb-3">
                <img src={img} alt={`Imagen ${index + 1}`} className="img-fluid rounded shadow" />
            </div>
            ))}
        </div>

        {/* Descripción */}
        <p className="lead text-center">{data.descripcion}</p>

        {/* Dirección */}
        <div className="text-center my-3">
            <strong>Dirección:</strong> {data.direccion}
        </div>

        {/* Mapa embebido */}
        <div className="my-4">
            <iframe
            src={data.urlMaps}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="Mapa Espacio Público"
            ></iframe>
        </div>

        {/* Botón Cómo Llegar */}
        <div className="text-center my-4">
            <ButtonComoLlegar
            destination={
                data.lat && data.lng
                ? { lat: String(data.lat), lng: String(data.lng) }
                : { lat: "0", lng: "0" }
            }
            />
        </div>
        </div>
    );
}