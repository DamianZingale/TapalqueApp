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
        className={`card-background ${extraClasses}`}
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
            className="card-overlay"
            style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
        >
            <h2
            className="card-title"
            style={{ fontSize, letterSpacing }}
            >
            {titulo}
            </h2>
        </div>
        </div>
    );
};