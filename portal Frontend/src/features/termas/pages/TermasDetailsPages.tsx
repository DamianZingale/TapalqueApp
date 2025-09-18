import { useParams } from "react-router-dom";
import { termasMock } from "./mocks/mockTermas";
import { ButtonComoLlegar } from "../../../shared/components/ButtonComoLlegar";

export default function TermasDetailPage({ idDefault }: { idDefault?: string }) {
    const { id } = useParams();
    const data = termasMock.find((t) => t.id === (id ?? idDefault));

    if (!data) return <p>Termas no encontradas</p>;

    return (
        <div className="container my-4">
        <h1 className="text-center mb-3">{data.titulo}</h1>

        {/* Carrusel de imágenes */}
        <div className="row justify-content-center mb-4">
            {data.imagenes.map((img, index) => (
            <div key={index} className="col-md-4 mb-3">
                <img
                src={img}
                alt={`Imagen ${index + 1}`}
                className="img-fluid rounded shadow"
                />
            </div>
            ))}
        </div>

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

        {/* Servicios */}
        <div className="my-3">
            <h5>Servicios disponibles:</h5>
            <ul>
            {data.servicios.map((serv, idx) => (
                <li key={idx}>{serv}</li>
            ))}
            </ul>
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

        {/* Mapa embebido */}
        <div className="my-4">
            <iframe
            src={data.urlMaps}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="Mapa Termas"
            ></iframe>
        </div>
        </div>
    );
}
