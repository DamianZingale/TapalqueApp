import { useEffect, useState } from "react";
import type { PropLocal, PropsAsignarLocalesAdmin } from "../../../shared/types/PropsAdminGeneral";


export const AsignarLocalesAdmin: React.FC<PropsAsignarLocalesAdmin> = ({ idAdmin, onAsignar }) => {
    const [locales, setLocales] = useState<PropLocal[]>([]);
    const [loading, setLoading] = useState(true);


    //Aca ir a buscar locales con el id de usuario asi solo pueden asignarse el rubro que corresponda
    useEffect(() => {
        if (!idAdmin) return;

        const locales = [
            { id: "3", nombre: "Club Social", direccion:"9 de julio 948"},
            { id: "4", nombre: "La Parrilla", direccion:"25 de mayo 345" },
        ];

        setLocales(locales);
        setLoading(false);
    }, [idAdmin]);
    return (
        <div className="mt-4 mb-3">
            <h5>Asignar local como administrador</h5>
            {loading ? (
                <p>Cargando locales...</p>
            ) : locales.length === 0 ? (
                <p>No se encontraron locales para este tipo.</p>
            ) : (
                <ul className="list-group">
                    {locales.map((local) => (
                        <li key={local.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{local.nombre}</strong><br />
                                <small>{local.direccion}</small>
                            </div>
                            <button className="btn btn-sm btn-secondary" onClick={() => onAsignar(local.id)}>
                                Asignar
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};