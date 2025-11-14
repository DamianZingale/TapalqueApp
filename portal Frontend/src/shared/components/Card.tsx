import type { CardProps } from "../types/ICardProps";
import styles from "../../shared/styles/cardPages.module.css"

export const Card: React.FC<CardProps> = ({ id, titulo, direccion_local, imagenUrl, tipo }) => {
    return (
        <div className={styles.layoutCard}>
        <img src={imagenUrl} alt={titulo} className={styles.CardImg}/>
        
            <h5 className={styles.cardSubtitle}>{titulo}</h5>
            {direccion_local && <p className={styles.cardDirection}>{direccion_local}</p>}
            <div className={styles.cardAncor}>
            <a href={`/${tipo}/${id}`} className={styles.ancorGo}>
                Go
                <img src="/LogoTpqGo.png" alt="Logo TapalquéGO" className={styles.AncorIcon} />
            </a>
            </div>
        
        </div>
    );
}; 
