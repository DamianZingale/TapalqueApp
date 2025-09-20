import { FaFacebook, FaInstagram, FaTwitter, FaTiktok } from "react-icons/fa";

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
        <div className="flex gap-3 justify-center my-3">
        {facebook && (
            <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
            aria-label="Facebook"
            >
            <FaFacebook size={28} />
            </a>
        )}
        {instagram && (
            <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 hover:text-pink-700"
            aria-label="Instagram"
            >
            <FaInstagram size={28} />
            </a>
        )}
        {twitter && (
            <a
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-500 hover:text-sky-700"
            aria-label="Twitter"
            >
            <FaTwitter size={28} />
            </a>
        )}
        {tiktok && (
            <a
            href={tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:text-gray-700"
            aria-label="TikTok"
            >
            <FaTiktok size={28} />
            </a>
        )}
        </div>
    );
};
