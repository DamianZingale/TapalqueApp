import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockHospedajes } from "../mocks/mockHospedajes";
import { BotonAgregar } from "../../components/BotonAgregar";
import { BotonesAccionHospedajeAdmin } from "../../components/BotonesAccionHospedajeAdmin";
import { ListadoLocalesUsuarios } from "../../components/ListadoLocales";
import type { Hospedaje } from "../types/typesHospedaje";

export const AdminGralHospedajesPage = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hospedajes] = useState<Hospedaje[]>(mockHospedajes);
    const navigate = useNavigate();

    const handleSelect = (id: string) => setSelectedId(id);

    const handleEditar = (id: string) => {
        navigate(`/administrador-general/hospedajes/editar/${id}`);
    };

return (
        <div className="container mt-4">
        <h2 className="text-center mb-4">Administración de Hospedajes</h2>

        <BotonAgregar />

        <div className="row">
            {hospedajes.map((hosp) => (
            <div key={hosp.id} className="col-md-4">
                <ListadoLocalesUsuarios
                id={hosp.id}
                estado={hosp.estado}
                nombre={hosp.nombre}
                direccionOtipo={`${hosp.habitaciones.length} habitaciones`}
                onSelect={handleSelect}
                selectedId={selectedId}
                />
            <BotonesAccionHospedajeAdmin
                id={hosp.id}
                estado={hosp.estado}
                onEditar={() => handleEditar(hosp.id)}
            />
        </div>
            ))}
        </div>
        </div>
    );
};
