import { useNavigate } from "react-router-dom";
export const BotonAgregar = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`nuevo`); // Ejemplo: '/admin/comercio/nuevo'
    };


    return (
        <div className="">
            <button onClick={handleClick} type="button" className="">Agregar nuevo</button>
        </div>
    )
}
