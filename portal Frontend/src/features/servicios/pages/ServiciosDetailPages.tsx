import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";
import { Carrusel } from "../../../shared/components/Carrusel";
import { Description } from "../../../shared/components/Description";
import { Title } from "../../../shared/components/Title";
import { SocialLinks } from "../../../shared/components/SocialLinks";
import { fetchServicioById, type Servicio } from "../../../services/fetchServicios";

export default function ServiciosDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState<Servicio | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchServicioById(id).then(servicio => {
                setData(servicio);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) return <div className="container text-center py-5">Cargando...</div>;
    if (!data) return <p className="container text-center py-5">Servicio no encontrado</p>;

    const imagenes = data.imagenes?.map(img => img.imagenUrl) || [];

    return (
        <div className="container">
            <Title text={data.titulo} />
            <Carrusel images={imagenes} />
            <SocialLinks
                facebook={data.facebook}
                instagram={data.instagram}
            />
            <Description description={data.descripcion || ""} />
            {data.horario && <div className="text-center my-3"><strong>Horario:</strong> {data.horario}</div>}
            {data.telefono && <WhatsAppButton num={data.telefono} />}
        </div>
    );
}