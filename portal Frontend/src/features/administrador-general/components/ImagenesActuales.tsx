export const ImagenesActuales: React.FC<{ files: string[] }> = ({ files }) => {
    return (
        <div className="">
            <label className="">Imágenes actuales</label>
            <div className="">
                {files.map((img, i) => {
                    return (
                        <div key={i} className="">
                            <img src={img} alt={`img-${i}`} className="" style={{ width: 100 }} />
                            {/* Botón para eliminar */}
                            <button className="">✕</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};