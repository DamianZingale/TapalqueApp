import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";
import { serviciosMock } from './mocks/mockServicios';

export default function ServiciosListPage() {
    return (
        <div className="container">
            <h1 className="text-center my-4">Servicios</h1>
            <div className="row justify-content-center">
                {serviciosMock.map((servicio) => (
                    <Card
                    key={servicio.id}
                    id={servicio.id}
                    titulo={servicio.titulo}
                    imagenUrl={servicio.imagenUrl}
                    direccion_local={servicio.direccion}
                    tipo={SECCION_TYPE.SERVICIOS}
                    />
                ))}
            </div>
        </div>
    );
}