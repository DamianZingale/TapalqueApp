import { useNavigate } from "react-router-dom";
import { CardBackground } from "./CardBackground";

export const CardTermas = () => {
    const navigate = useNavigate();
    return (
        <CardBackground
            titulo="TERMAS"
            imagenUrl="https://termastapalque.com.ar/wp-content/uploads/2023/08/piletas-02-b.webp"
            onClick={() => navigate("/termas")}
        />
    );
};
