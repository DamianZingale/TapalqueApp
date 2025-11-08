import { FaWhatsapp } from "react-icons/fa";
import type { WhatsAppButtonProps } from "../types/PropsGeneralesVerMas";
import styles from "../components/styles/WhatsAppButton.module.css";

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ num }) => {
    const url = `https://wa.me/549${num}`;

    return (
        <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappFloat}
        aria-label="Chat en WhatsApp"
        >
        <FaWhatsapp size={28} />
        </a>
    );
};