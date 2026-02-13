import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardBackground } from "./CardBackground";

interface HomeConfig {
    seccion: string;
    imagenUrl: string | null;
    titulo: string | null;
    activo: boolean;
}

const DEFAULT_TERMAS_IMAGE = "https://termastapalque.com.ar/wp-content/uploads/2023/08/piletas-02-b.webp";

export const CardTermas = () => {
    const navigate = useNavigate();
    const [imagenUrl, setImagenUrl] = useState<string>(DEFAULT_TERMAS_IMAGE);

    useEffect(() => {
        const cargarImagenTermas = async () => {
            try {
                const res = await fetch('/api/home-config/active');
                if (!res.ok) throw new Error('Error cargando configuración');
                const configs: HomeConfig[] = await res.json();

                const termasConfig = configs.find(c => c.seccion === 'TERMAS');
                if (termasConfig?.imagenUrl) {
                    setImagenUrl(termasConfig.imagenUrl);
                }
            } catch (error) {
                console.warn('No se pudo cargar la configuración de Termas, usando imagen por defecto');
            }
        };

        cargarImagenTermas();
    }, []);

    return (
        <CardBackground
            titulo="TERMAS"
            imagenUrl={imagenUrl}
            onClick={() => navigate("/termas")}
            overlayOpacity={0.45}
            letterSpacing="1.6em"
            fontSize="1.5rem"
        />
    );
};
