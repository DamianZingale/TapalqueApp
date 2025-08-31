import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";

export default function ServiciosListPage() {
    return (
        <div className="container">
            <h1 className="text-center my-4">Servicios</h1>
            <div className="row justify-content-center">
                <Card
                    id="cordoba-123"
                    titulo="Hospedaje en Córdoba"
                    imagenUrl="https://ejemplo.com/img/cordoba.jpg" 
                    tipo= {SECCION_TYPE.SERVICIOS}
                    />
            </div>
        </div>
    );
}