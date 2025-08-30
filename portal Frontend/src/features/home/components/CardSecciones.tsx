import { useNavigate } from "react-router-dom";

interface CardSeccionesProps {
    titulo: string;
    imagenUrl: string;
    destino: string;
}

export const CardSecciones: React.FC<CardSeccionesProps> = ({
    titulo,
    imagenUrl,
    destino,
}) => {
    const navigate = useNavigate()
    return (
        <div
            className="card text-white"
            style={{
                backgroundImage: `url(${imagenUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "180px",
                cursor: "pointer",
                borderRadius: "0.5rem",
                overflow: "hidden",
            }}
            onClick={() => navigate(destino)}
        >
            <div
                className="card-img-overlay d-flex justify-content-center align-items-center"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
                <h2
                    className="card-title text-center fw-bold"
                    style={{ letterSpacing: "0.1em", fontSize: "1.2rem" }}
                >
                    {titulo}
                </h2>
            </div>
        </div>
    );
};