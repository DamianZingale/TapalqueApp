import { useParams } from "react-router-dom";
import { termasMock } from "./mocks/mockTermas";
import { Carrusel } from "../../../shared/components/Carrusel";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { SocialLinks } from "../../../shared/components/SocialLinks";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import styles from "../../../shared/components/styles/termas.module.css"

export default function TermasDetailPage({ idDefault }: { idDefault?: string }) {
    const { id } = useParams();
    const data = termasMock.find((t) => t.id === (id ?? idDefault));

    if (!data) return <p>Termas no encontradas</p>;

    return (
        <div>
        <h1 className={styles.tittle}>{data.titulo}</h1>

        <Carrusel images={data.imagenes} />

        <SocialLinks
            facebook={data.facebook}
            instagram={data.instagram}
            twitter={data.twitter}
            tiktok={data.tiktok}
        />

        <p>{data.descripcion}</p>

        <div>
            <strong>Horarios:</strong> {data.horarios}
        </div>

        {data.urlWeb && (
            <div>
            <a
                href={data.urlWeb}
                target="_blank"
                rel="noopener noreferrer"
            >
                Ir a la web de Termas
            </a>
            </div>
        )}

        <div>
            <a
            href={data.urlMaps}
            target="_blank"
            rel="noopener noreferrer"
            >
            Cómo Llegar
            </a>
        </div>

        <div>
            <h5>Servicios disponibles:</h5>
            <ul>
            {data.servicios.map((serv, idx) => (
                <li key={idx}>{serv}</li>
            ))}
            </ul>
        </div>

        <WhatsAppButton num={data.num} />
        </div>
    );
}