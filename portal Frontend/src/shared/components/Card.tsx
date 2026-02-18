import type { CardProps } from "../types/ICardProps"

export const Card: React.FC<CardProps> = ({ id, titulo, direccion_local, imagenUrl, tipo, schedule, descripcion, onClick }) => {
    return (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3 my-2 d-flex justify-content-center">
            <div className="card h-100 d-flex flex-column" style={{ width: "18rem", maxWidth: "100%" }}>
                <img
                    src={imagenUrl}
                    className="card-img-top p-1"
                    alt={titulo}
                    style={{ height: "180px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column flex-grow-1">
                    <h5 className="card-title text-center">{titulo}</h5>
                    {direccion_local && <p className="text-center text-muted mb-2">{direccion_local}</p>}
                    {schedule && <p className="text-center text-muted mb-2"><small>{schedule}</small></p>}
                    {descripcion && (
                        <p className="text-center text-muted mb-2 small" style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical"
                        }}>{descripcion}</p>
                    )}
                    <div className="d-grid gap-2 col-6 mx-auto mt-auto">
                        <button onClick={onClick} className="btn btn-secondary p-1">Ver mas</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
