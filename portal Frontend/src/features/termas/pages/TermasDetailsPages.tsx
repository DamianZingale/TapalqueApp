import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Carrusel } from "../../../shared/components/Carrusel";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { SocialLinks } from "../../../shared/components/SocialLinks";
import { fetchTermaById, Terma } from "../../../services/fetchTermas";

export default function TermasDetailPage({ idDefault }: { idDefault?: string }) {
    const { id } = useParams();
    const [data, setData] = useState<Terma | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarTerma = async () => {
            const termaId = id ?? idDefault;
            if (termaId) {
                setLoading(true);
                const terma = await fetchTermaById(termaId);
                setData(terma);
                setLoading(false);
            }
        };
        cargarTerma();
    }, [id, idDefault]);

    if (loading) {
        return (
            <div className="container text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (!data) return <p className="text-center py-5">Termas no encontradas</p>;

    // Convertir imágenes al formato esperado
    const imagenes = data.imagenes?.map(img => img.imagenUrl) || [];

    return (
        <div className="container my-4">
            <h1 className="text-center mb-3">{data.titulo}</h1>

            {/* Carrusel de imágenes */}
            <Carrusel images={imagenes} />

            <SocialLinks />

            {/* Descripción */}
            <p className="lead text-center">{data.description}</p>

            {/* Horarios */}
            <div className="text-center my-3">
                <strong>Horarios:</strong> {data.horario}
            </div>

            {/* Botón Cómo Llegar */}
            {data.latitud && data.longitud && (
                <div className="text-center my-4">
                    <a
                        href={`https://www.google.com/maps?q=${data.latitud},${data.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-[11rem] h-[2rem] bg-black text-white rounded-3xl text-[1rem] cursor-pointer flex justify-center items-center transition-all duration-300 hover:bg-[#333]"
                    >
                        Cómo Llegar
                    </a>
                </div>
            )}

            {/* BTN teléfono/contacto */}
            {data.telefono && <WhatsAppButton num={data.telefono} />}
        </div>
    );
}
