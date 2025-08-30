import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";

export default function EsPublicosListPage() {
    return (
        <div className="container">
            <h1 className="text-center my-4">Espacios publicos</h1>
            <div className="row justify-content-center">
                <Card
                    id="cordoba-123"
                    titulo="Hospedaje en Córdoba"
                    imagenUrl="https://ejemplo.com/img/cordoba.jpg" 
                    tipo= {SECCION_TYPE.ESP_PUBLICOS}
                    />
            </div>
        </div>
    );
}