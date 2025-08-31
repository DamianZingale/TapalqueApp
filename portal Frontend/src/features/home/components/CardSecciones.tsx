import { useNavigate } from "react-router-dom";
import { CardBackground } from "./CardBackground";

export const CardSecciones = ({ titulo, imagenUrl, destino }: {
    titulo: string;
    imagenUrl: string;
    destino: string;
}) => {
    const navigate = useNavigate();
    return (
        <CardBackground
            titulo={titulo}
            imagenUrl={imagenUrl}
            onClick={() => navigate(destino)}
        />
    );
};