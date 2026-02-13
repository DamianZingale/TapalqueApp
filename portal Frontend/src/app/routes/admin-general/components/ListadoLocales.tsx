import type { PropsListadoLocalesUsuarios } from "../../../shared/types/PropsAdminGeneral";

export const ListadoLocalesUsuarios: React.FC<PropsListadoLocalesUsuarios> = ({ id, estado, nombre, direccionOtipo, onSelect, selectedId }) => {
    return (
        <div
            className={`card text-center mb-4 cursor-pointer ${selectedId === id ? 'border-secondary' : ''}`}
            onClick={() => onSelect?.(id)}
        >
            <div className="card-header">{estado}</div>
            <div className="card-body">
                <h5 className="card-title">{nombre}</h5>
            </div>
            <div className="card-footer text-body-secondary">{direccionOtipo}</div>
        </div>
    );
}
