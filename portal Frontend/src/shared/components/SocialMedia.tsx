import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";

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
        <div className="flex gap-4 justify-center items-center my-4">
        {redes.map((red) => (
            <a
            key={red.nombre}
            href={red.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={red.nombre}
            className="text-white p-2 rounded-full bg-black hover:bg-gray-800 transition-all duration-300"
            >
            {red.icono}
            </a>
        ))}
        </div>
    );
};