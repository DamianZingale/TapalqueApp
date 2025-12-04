import type { PropsListadoLocalesUsuarios } from "../../../shared/types/PropsAdminGeneral";

export const ListadoLocalesUsuarios: React.FC<PropsListadoLocalesUsuarios> = ({ id, estado, nombre, direccionOtipo, onSelect, selectedId }) => {
    return (
        <div
            className={`card text-center mb-4 cursor-pointer ${selectedId === id ? 'border-secondary' : ''}`}
            onClick={() => onSelect?.(id)}
        >
            <div className="">{estado}</div>
            <div className="">
                <h5 className="">{nombre}</h5>
            </div>
            <div className="">{direccionOtipo}</div>
        </div>
    );
}
