import { espaciosMock } from "./mocks/espaciosMock";
import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";
import { Link } from "react-router-dom";

export default function EspaciosListPage() {
    return (
        <div className="container my-4">
        <h1 className="text-center mb-4">Espacios Públicos</h1>
        <div className="row justify-content-center">
            {espaciosMock.map((espacio) => (
            <div key={espacio.id} className="col-md-4 mb-4">
                <Link to={`/espublicos/${espacio.id}`} className="text-decoration-none">
                <Card
                    id={espacio.id}
                    titulo={espacio.titulo}
                    imagenUrl={espacio.imagenUrl}
                    direccion_local={espacio.direccion}
                    tipo={SECCION_TYPE.ESP_PUBLICOS}
                />
                </Link>
            </div>
            ))}
        </div>
        </div>
    );
}