import { useNavigate } from "react-router-dom";
import { CardBackground } from "./CardBackground";

export const CardSecciones = ({ titulo, imagenUrl, destino, categoria }: {
    titulo: string;
    imagenUrl?: string;
    destino: string;
    categoria?: 'comercio' | 'gastronomia' | 'hospedaje' | 'servicios' | 'eventos' | 'espacios' | 'termas';
}) => {
    const navigate = useNavigate();
    return (
        <CardBackground
            titulo={titulo}
            imagenUrl={imagenUrl}
            onClick={() => navigate(destino)}
            categoria={categoria}
        />
    );
};