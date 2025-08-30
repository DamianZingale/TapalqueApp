import type { CardProps } from "../types/ICardProps"

export const Card: React.FC<CardProps> = ({ id, titulo, imagenUrl }) => {
    return (
        <div className="card my-2 me-3" style={{ width: "18rem" }}>
            <img src={imagenUrl} className="card-img-top p-1" alt="..." />
            <div className="card-body ">
                <h5 className="card-title text-center">{titulo}</h5>
                <div className="d-grid gap-2 col-6 mx-auto">
                    <a href={`/hospedaje/${id}`} className="btn btn-secondary p-1">Ver mas</a>
                </div>
            </div>
        </div>
    )
}
