import type { CardProps } from "../types/ICardProps";

export const Card: React.FC<CardProps> = ({ id, titulo, direccion_local, imagenUrl, tipo }) => {
    return (
        <div>
        <img src={imagenUrl} alt={titulo} />
        <div>
            <h5>{titulo}</h5>
            {direccion_local && <p>{direccion_local}</p>}
            <div>
            <a href={`/${tipo}/${id}`}>Ver más</a>
            </div>
        </div>
        </div>
    );
}; 
