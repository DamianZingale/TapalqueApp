import { useNavigate } from "react-router-dom";

export const CardTermas = () => {
    
    const navigate = useNavigate();
    const titulo = "TERMAS";
    const imagenUrl = "https://termastapalque.com.ar/wp-content/uploads/2023/08/piletas-02-b.webp";
    const destino = "/termas"; // ruta a la que navega
    return (
        <div
            className="card text-white mb-4 "
            style={{
                backgroundImage: `url(${imagenUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "170px",
                cursor: "pointer",
                position: "relative",
                borderRadius: "0.5rem",
                overflow: "hidden",
            }}
            onClick={() => navigate(destino)}
        >
            <div
                className="card-img-overlay d-flex flex-column justify-content-center align-items-center"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
            >
                <h2 className="fw-bold" style={{ letterSpacing: "1.60em" }}>{titulo}</h2>
            </div>
        </div>
    );
};