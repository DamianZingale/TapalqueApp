import { FaFacebook, FaInstagram, FaTwitter, FaTiktok } from "react-icons/fa";
import styles from "./styles/socialLinks.module.css";

interface SocialLinksProps {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
    facebook,
    instagram,
    twitter,
    tiktok,
}) => {
    return (
        <div className={styles.socialContainer}>
        {facebook && (
            <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className={styles.facebook}
            >
            <FaFacebook size={28} />
            </a>
        )}
        {instagram && (
            <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={styles.instagram}
            >
            <FaInstagram size={28} />
            </a>
        )}
        {twitter && (
            <a
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className={styles.twitter}
            >
            <FaTwitter size={28} />
            </a>
        )}
        {tiktok && (
            <a
            href={tiktok}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className={styles.tiktok}
            >
            <FaTiktok size={28} />
            </a>
        )}
        </div>
    );
};