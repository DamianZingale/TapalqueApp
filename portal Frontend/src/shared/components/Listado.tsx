import type { PropsListado } from "../types/PropsPerfil"

export const Listado: React.FC<PropsListado> = ({ id, encabezado, titulo, pie, textButton, handleButton }) => {
    return (
        <div className="card text-center mb-4">
            <div className="card-header">
                {encabezado}
            </div>
            <div className="card-body">
                <h5 className="card-title">{titulo}</h5>
                <a
                    onClick={(e) => {
                        e.preventDefault();
                        handleButton?.(id);
                    }}
                    className="btn btn-secondary">{textButton}</a>
            </div>
            <div className="card-footer text-body-secondary">
                {pie}
            </div>
        </div>
    )
}
