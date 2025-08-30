interface CardBackgroundProps {
    titulo: string;
    imagenUrl: string;
    onClick?: () => void;
    overlayOpacity?: number;
    fontSize?: string;
    letterSpacing?: string;
    extraClasses?: string;
}

export const CardBackground: React.FC<CardBackgroundProps> = ({
    titulo,
    imagenUrl,
    onClick,
    overlayOpacity = 0.4,
    fontSize = "1.2rem",
    letterSpacing = "0.1em",
    extraClasses = "",
}) => {
    return (
        <div
            className={`card text-white mb-4 ${extraClasses}`}
            style={{
                backgroundImage: `url(${imagenUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "170px",
                cursor: "pointer",
                borderRadius: "0.5rem",
                overflow: "hidden",
            }}
            onClick={onClick}
        >
            <div
                className="card-img-overlay d-flex justify-content-center align-items-center g-0"
                style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
            >
                <h2
                    className="fw-bold text-center"
                    style={{ fontSize, letterSpacing }}
                >
                    {titulo}
                </h2>
            </div>
        </div>
    );
};
