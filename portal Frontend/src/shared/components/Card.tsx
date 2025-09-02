import type { CardProps } from "../types/ui/ICardProps"

export const Card: React.FC<CardProps> = ({ id, titulo, direccion_local, imagenUrl, tipo }) => {
    return (
        <div className="card my-2 me-3" style={{ width: "18rem" }}>
            <img src={imagenUrl} className="card-img-top p-1" alt="..." />
            <div className="card-body ">
                <h5 className="card-title text-center">{titulo}</h5>
                {direccion_local && <p className="text-center text-muted">{direccion_local}</p>}
                <div className="d-grid gap-2 col-6 mx-auto">
                    <a href={`/${tipo}/${id}`} className="btn btn-secondary p-1">Ver mas</a>
                </div>
            </div>
        </div>
    )
}
