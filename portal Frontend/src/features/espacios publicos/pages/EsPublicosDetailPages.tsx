import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Carrusel } from "../../../shared/components/Carrusel";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { SocialLinks } from "../../../shared/components/SocialLinks";
import { fetchEspacioPublicoById, EspacioPublico } from "../../../services/fetchEspaciosPublicos";

export default function EspaciosDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState<EspacioPublico | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarEspacio = async () => {
            if (id) {
                setLoading(true);
                const espacio = await fetchEspacioPublicoById(id);
                setData(espacio);
                setLoading(false);
            }
        };
        cargarEspacio();
    }, [id]);

    if (loading) {
        return (
            <div className="container text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (!data) return <p className="text-center py-5">Espacio no encontrado</p>;

    // Convertir imágenes al formato esperado
    const imagenes = data.imagenes?.map(img => img.imagenUrl) || [];

    return (
        <div className="container my-4">
            <h1 className="text-center mb-3">{data.titulo}</h1>

            {/* Carrusel de imágenes */}
            <Carrusel images={imagenes} />

            {/* Botón Cómo Llegar */}
            {data.latitud && data.longitud && (
                <div className="text-center my-3">
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

            {/* Redes sociales */}
            <SocialLinks
                facebook={data.facebook}
                instagram={data.instagram}
                twitter={data.twitter}
                tiktok={data.tiktok}
            />

            {/* Descripción */}
            <p className="lead text-center">{data.descripcion}</p>

            {/* Dirección */}
            <div className="text-center my-3">
                <strong>Dirección:</strong> {data.direccion}
            </div>

            {/* Horario si existe */}
            {data.horario && (
                <div className="text-center my-3">
                    <strong>Horarios:</strong> {data.horario}
                </div>
            )}

            {/* Btn whatsapp */}
            {data.telefono && <WhatsAppButton num={data.telefono} />}
        </div>
    );
}
