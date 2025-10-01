export interface EspacioPublico {
    id: string;
    titulo: string;
    imagenUrl: string;
    descripcion: string;
    direccion: string;
    tel?: string;
    imagenes: string[];
    urlMaps: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
}

export const espaciosMock: EspacioPublico[] = [
    {
        id: "espacio-1",
        titulo: "Balneario Municipal",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Balneario+Tapalqué",
        descripcion: "Complejo recreativo con natatorio cubierto, fogones, colonia de vacaciones, canchas y zona de camping.",
        direccion: "Ruta 51 y Arroyo Tapalqué",
        tel: "2281545498",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Natatorio",
        "https://via.placeholder.com/400x200.png?text=Fogones"
        ],
        urlMaps: `https://www.google.com/maps?q=${-36.348803},${-60.007554}`,
        facebook: "https://www.facebook.com/Balneario-Municipal-de-Tapalqué-113456408487762/"
    },
    {
        id: "espacio-2",
        titulo: "Plaza Néstor Kirchner",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Plaza+Néstor+Kirchner",
        descripcion: "Espacio inclusivo con juegos infantiles, monumentos a las Madres de Plaza de Mayo, Malvinas y glaciares.",
        direccion: "Barrio Néstor Kirchner, Tapalqué",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Juegos+Inclusivos",
        "https://via.placeholder.com/400x200.png?text=Monumentos"
        ],
        urlMaps: `https://www.google.com/maps?q=${-36.365521},${-60.024219}`,
        facebook: "https://www.facebook.com/municipalidadtapalque/videos/inauguramos-la-plaza-néstor-kirchner-/968594043831313/",
        tiktok: "https://www.tiktok.com/@muni_tapalque"
    },
    {
        id: "espacio-3",
        titulo: "Museo Municipal de Crotto",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Museo+Crotto",
        descripcion: "Museo comunitario en la antigua estación de tren, con objetos, fotos y relatos de la historia local.",
        direccion: "Estación Crotto, Partido de Tapalqué",
        tel: "2281545498",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Estación+Histórica",
        "https://via.placeholder.com/400x200.png?text=Objetos+Antiguos"
        ],
        urlMaps: `https://www.google.com/maps?q=${-36.348803},${-60.007554}`,
        facebook: "https://www.facebook.com/Tapalqueenamora/posts/museo-municipal-comunitario-de-crotto-este-sábado-12-de-enero-inauguramos-el-mus/939884729537943/"
    },
    {
        id: "espacio-4",
        titulo: "Costanera del Arroyo",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Costanera+del+Arroyo",
        descripcion: "Sendero natural de 10 km ideal para caminatas, pesca, kayak y bici. Conectado al balneario.",
        direccion: "A lo largo del Arroyo Tapalqué",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Sendero",
        "https://via.placeholder.com/400x200.png?text=Kayak"
        ],
        urlMaps: `https://www.google.com/maps?q=${-36.348803},${-60.007554}`,
        facebook: "https://www.facebook.com/groups/pueblosbsas/posts/4057625324285524/"
    },
    {
        id: "espacio-5",
        titulo: "Centro Cultural Ricardo Romera",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Centro+Cultural",
        descripcion: "Espacio de cine, exposiciones y talleres. Sede del Cine INCAA y del museo histórico local.",
        direccion: "San Martín y Mitre, Tapalqué",
        tel: "2281545498",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Cine+INCAA",
        "https://via.placeholder.com/400x200.png?text=Exposiciones"
        ],
        urlMaps: `https://www.google.com/maps?q=${-36.348803},${-60.007554}`,
        facebook: "https://www.facebook.com/municipalidadtapalque/videos/-el-centro-cultural-municipal-dr-ricardo-romera-es-un-espacio-lleno-de-historias/926870178065820/"
    }
];