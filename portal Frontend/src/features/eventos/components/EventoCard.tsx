import styles from "./EventoCard.module.css";

interface Props {
    titulo: string;
    descripcion: string;
    fecha: string;
    hora: string;
    lugar: string;
    imagenUrl: string;
    telefono: string;
}

export function EventoCard({
    titulo,
    descripcion,
    fecha,
    hora,
    lugar,
    imagenUrl,
    telefono,
}: Props) {
    return (
        <div className={styles.card}>
        <h2 className={styles.titulo}>{titulo}</h2>
        <div className={styles.contenido}>
            <img src={imagenUrl} alt={titulo} className={styles.imagen} />
            <div className={styles.info}>
            <p>{descripcion}</p>
            <p><strong>Lugar:</strong> {lugar}</p>
            <p><strong>Fecha:</strong> {fecha} {hora}</p>
            <a
                href={`https://wa.me/${telefono}?text=Hola! Quiero reservar para ${titulo}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.boton}
            >
                Reservar
            </a>
            </div>
        </div>
        </div>
    );
}
