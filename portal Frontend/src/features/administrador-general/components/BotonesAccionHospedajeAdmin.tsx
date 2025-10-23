interface Props {
    id: string;
    estado: string;
    onEditar?: () => void;
    onEliminar?: () => void;
    onActivarDesactivar?: (id: string) => void;
}

export const BotonesAccionHospedajeAdmin = ({
    id,
    estado,
    onEditar,
    onEliminar,
    onActivarDesactivar,
    }: Props) => {
    const handleActivarDesactivar = () => {
        if (onActivarDesactivar) {
        onActivarDesactivar(id);
        } else {
        alert(`Llamar al backend para cambiar estado del hospedaje ${id}`);
        }
    };

    const handleEliminar = () => {
        if (onEliminar) {
        onEliminar();
        } else {
        alert(`Llamar al backend para eliminar hospedaje ${id}`);
        }
    };

    return (
        <div className="d-flex gap-2 justify-content-center mb-3">
        <button
            className={`btn ${estado === "Activo" ? "btn-warning" : "btn-success"}`}
            onClick={handleActivarDesactivar}
        >
            {estado === "Activo" ? "Desactivar" : "Activar"}
        </button>

        <button onClick={onEditar} className="btn btn-primary">
            Editar
        </button>

        <button onClick={handleEliminar} className="btn btn-danger">
            Eliminar
        </button>
        </div>
    );
};
