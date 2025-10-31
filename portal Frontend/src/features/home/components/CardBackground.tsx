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
                        <h2 className={styles.title}>{titulo}</h2>
                        <div
                            className={styles.imageBox}
                            style={{ backgroundImage: `url(${imagenUrl})` }}
                            onClick={onClick}
                            />
                        </div>

                </div>
        );
};

