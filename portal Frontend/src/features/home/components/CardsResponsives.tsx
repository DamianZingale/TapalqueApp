import { useEffect, useState } from "react";
import { CardSecciones } from "./CardSecciones";

interface HomeConfig {
    seccion: string;
    imagenUrl: string | null;
    titulo: string | null;
    activo: boolean;
}

type CategoriaType = 'comercio' | 'gastronomia' | 'hospedaje' | 'servicios' | 'eventos' | 'espacios' | 'termas';

interface CardData {
    titulo: string;
    imagenUrl?: string;
    categoria: CategoriaType;
    destino: string;
}

const defaultCards: CardData[] = [
    { titulo: "Comercios", imagenUrl: undefined, categoria: "comercio", destino: "/comercio" },
    { titulo: "Gastronomia", imagenUrl: undefined, categoria: "gastronomia", destino: "/gastronomia" },
    { titulo: "Hospedajes", imagenUrl: undefined, categoria: "hospedaje", destino: "/hospedaje" },
    { titulo: "Servicios", imagenUrl: undefined, categoria: "servicios", destino: "/servicios" },
    { titulo: "Espacios Publicos", imagenUrl: undefined, categoria: "espacios", destino: "/espublicos" },
    { titulo: "Eventos", imagenUrl: undefined, categoria: "eventos", destino: "/eventos" },
];

const seccionToCategoria: Record<string, CategoriaType> = {
    COMERCIO: 'comercio',
    GASTRONOMIA: 'gastronomia',
    HOSPEDAJE: 'hospedaje',
    SERVICIOS: 'servicios',
    ESPACIOS: 'espacios',
    EVENTOS: 'eventos',
    TERMAS: 'termas',
};

export const CardGridResponsive = () => {
    const [cards, setCards] = useState<CardData[]>(defaultCards);

    useEffect(() => {
        const cargarConfiguracion = async () => {
            try {
                const res = await fetch('/api/home-config/active');
                if (!res.ok) throw new Error('Error cargando configuración');
                const configs: HomeConfig[] = await res.json();

                // Actualizar cards con las imágenes configuradas
                const updatedCards = defaultCards.map(card => {
                    const config = configs.find(
                        c => seccionToCategoria[c.seccion] === card.categoria
                    );
                    if (config?.imagenUrl) {
                        return { ...card, imagenUrl: config.imagenUrl };
                    }
                    return card;
                });

                setCards(updatedCards);
            } catch (error) {
                console.warn('No se pudo cargar la configuración del home, usando valores por defecto');
            }
        };

        cargarConfiguracion();
    }, []);

    return (
        <div className="row justify-content-center g-4 ">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="col-12 col-sm-6 col-md-5 col-lg-4 "
                >
                    <CardSecciones
                        titulo={card.titulo}
                        imagenUrl={card.imagenUrl}
                        destino={card.destino}
                        categoria={card.categoria}
                    />
                </div>
            ))}
        </div>
    );
};
