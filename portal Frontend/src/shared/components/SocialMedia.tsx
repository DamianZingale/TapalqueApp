import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";
import styles from "./RedesSociales.module.css";

interface RedSocial {
    nombre: string;
    url: string;
    icono: JSX.Element;
}

interface RedesSocialesProps {
    redes: RedSocial[];
}

export const RedesSociales: React.FC<RedesSocialesProps> = ({ redes }) => {
    return (
        <div className={styles.socialContainer}>
        {redes.map((red) => (
            <a
            key={red.nombre}
            href={red.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={red.nombre}
            className={styles.socialButton}
            >
            {red.icono}
            </a>
        ))}
        </div>
    );
};