import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";
import { comerciosMock } from './mocks/mockComercios'

export default function ComercioListPage() {
    return (
        <div className="container">
        <h1 className="text-center my-4">Comercios</h1>
        <div className="row justify-content-center">
            {comerciosMock.map((comercio) => (
            <Card
                key={comercio.id}
                id={comercio.id}
                titulo={comercio.titulo}
                imagenUrl={comercio.imagenUrl}
                direccion_local={comercio.direccion}
                tipo={SECCION_TYPE.COMERCIO}
            />

            ))}
        </div>
        </div>
    );
}