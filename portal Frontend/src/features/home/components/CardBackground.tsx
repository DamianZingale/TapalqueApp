import styles from "../styles/cardBackground.module.css"

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
        }) => {
        return (

                <div className={styles.backgroundCard}>
                    <div className="">
                        <h2>{titulo}</h2>
                        <div
                            className=""
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
                        />
                    </div>
                </div>
        );
        };

