import { Card } from "../../../shared/components/Card";
import { SECCION_TYPE } from "../../../shared/constants/constSecciones";
import { serviciosMock } from './mocks/mockServicios';
import styles from "../../../shared/styles/listPages.module.css"

export default function ServiciosListPage() {
    return (
        <div className={styles.layout}>
            <h1 className={styles.tittle}>Servicios</h1>
            <div className={styles.layoutBox}>
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