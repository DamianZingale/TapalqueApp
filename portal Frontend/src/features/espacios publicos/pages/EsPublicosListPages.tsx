import { espaciosMock } from "./mocks/espaciosMock";
import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";
import { Link } from "react-router-dom";

export default function EspaciosListPage() {
    return (
        <div className="">
        <h1 className="">Espacios Públicos</h1>
        <div className="">
            {espaciosMock.map((espacio) => (
            <div key={espacio.id} className="">
                <Link to={`/espublicos/${espacio.id}`} className="">
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