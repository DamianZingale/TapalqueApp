import type { CardProps } from "../types/ICardProps"

export const Card: React.FC<CardProps> = ({ id, titulo, direccion_local, imagenUrl, tipo, onClick }) => {
    return (
        <div className="col-auto my-2">
            <div className="card h-100 d-flex flex-column" style={{ width: "18rem" }}>
                <img
                    src={imagenUrl}
                    className="card-img-top p-1"
                    alt={titulo}
                    style={{ height: "180px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column flex-grow-1">
                    <h5 className="card-title text-center">{titulo}</h5>
                    {direccion_local && <p className="text-center text-muted mb-2">{direccion_local}</p>}
                    <div className="d-grid gap-2 col-6 mx-auto mt-auto">
                        <button onClick={onClick} className="btn btn-secondary p-1">Ver mas</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
