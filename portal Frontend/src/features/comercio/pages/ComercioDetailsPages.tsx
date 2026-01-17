import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Title } from "../../../shared/components/Title";
import { Carrusel } from "../../../shared/components/Carrusel";
import { Description } from "../../../shared/components/Description";
import { Horarios } from "../../../shared/components/Horarios";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { SocialLinks } from "../../../shared/components/SocialLinks";
import { fetchComercioById, Comercio } from "../../../services/fetchComercios";

export default function ComercioDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState<Comercio | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarComercio = async () => {
            if (id) {
                setLoading(true);
                const comercio = await fetchComercioById(id);
                setData(comercio);
                setLoading(false);
            }
        };
        cargarComercio();
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

    if (!data) return <p className="text-center py-5">Comercio no encontrado</p>;

    // Convertir imágenes al formato esperado por Carrusel
    const imagenes = data.imagenes?.map(img => img.imagenUrl) || [];

    // Convertir horario string a formato de array para Horarios
    const horariosArray = data.horario ? [{ dia: "Horarios", horas: data.horario }] : [];

    return (
        <div className="container">
            <Title text={data.titulo} />
            <Carrusel images={imagenes} />

            {/* Redes sociales */}
            <SocialLinks
                facebook={data.facebook}
                instagram={data.instagram}
            />

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

            <Description description={data.descripcion} />
            <Horarios horarios={horariosArray} />

            <WhatsAppButton num={data.telefono} />
            <div className="text-center my-3"></div>
        </div>
    );
}
