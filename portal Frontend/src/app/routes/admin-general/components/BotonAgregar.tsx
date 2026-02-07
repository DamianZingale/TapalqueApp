import { useNavigate } from "react-router-dom";
export const BotonAgregar = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`nuevo`); // Ejemplo: '/admin/comercio/nuevo'
    };


    return (
        <div className="d-flex gap-2 justify-content-center mb-3">
            <button onClick={handleClick} type="button" className="btn btn-secondary btn-lg">Agregar nuevo</button>
        </div>
    )
}
