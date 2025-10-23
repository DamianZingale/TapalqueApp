export const ImagenesActuales: React.FC<{ files: string[] }> = ({ files }) => {
    return (
        <div className="mb-3">
            <label className="form-label">Imágenes actuales</label>
            <div className="d-flex flex-wrap gap-2">
                {files.map((img, i) => {
                    return (
                        <div key={i} className="position-relative">
                            <img src={img} alt={`img-${i}`} className="img-thumbnail" style={{ width: 100 }} />
                            {/* Botón para eliminar */}
                            <button className="btn btn-sm btn-danger position-absolute top-0 end-0">✕</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};