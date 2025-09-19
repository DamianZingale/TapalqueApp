export interface EspacioPublico {
    id: string;
    titulo: string;
    imagenUrl: string;
    descripcion: string;
    direccion: string;
    lat: number;
    lng: number;
    imagenes: string[];
    urlMaps: string;
}

export const espaciosMock: EspacioPublico[] = [
    {
        id: "espacio-1",
        titulo: "Balneario Municipal",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Balneario+Tapalqué",
        descripcion: "Complejo recreativo con natatorio cubierto, fogones, colonia de vacaciones, canchas y zona de camping.",
        direccion: "Ruta 51 y Arroyo Tapalqué",
        lat: -36.3559,
        lng: -60.0265,
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Natatorio",
        "https://via.placeholder.com/400x200.png?text=Fogones"
        ],
        urlMaps: "https://www.google.com/maps/embed?..."
    },
    {
        id: "espacio-2",
        titulo: "Plaza Néstor Kirchner",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Plaza+Néstor+Kirchner",
        descripcion: "Espacio inclusivo con juegos infantiles, monumentos a las Madres de Plaza de Mayo, Malvinas y glaciares.",
        direccion: "Barrio Néstor Kirchner, Tapalqué",
        lat: -36.3542,
        lng: -60.0248,
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Juegos+Inclusivos",
        "https://via.placeholder.com/400x200.png?text=Monumentos"
        ],
        urlMaps: "https://www.google.com/maps/embed?..."
    },
    {
        id: "espacio-3",
        titulo: "Museo Municipal de Crotto",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Museo+Crotto",
        descripcion: "Museo comunitario en la antigua estación de tren, con objetos, fotos y relatos de la historia local.",
        direccion: "Estación Crotto, Partido de Tapalqué",
        lat: -36.4601,
        lng: -60.2153,
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Estación+Histórica",
        "https://via.placeholder.com/400x200.png?text=Objetos+Antiguos"
        ],
        urlMaps: "https://www.google.com/maps/embed?..."
    },
    {
        id: "espacio-4",
        titulo: "Costanera del Arroyo",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Costanera+del+Arroyo",
        descripcion: "Sendero natural de 10 km ideal para caminatas, pesca, kayak y bici. Conectado al balneario.",
        direccion: "A lo largo del Arroyo Tapalqué",
        lat: -36.3565,
        lng: -60.0271,
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Sendero",
        "https://via.placeholder.com/400x200.png?text=Kayak"
        ],
        urlMaps: "https://www.google.com/maps/embed?..."
    },
    {
        id: "espacio-5",
        titulo: "Centro Cultural Ricardo Romera",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Centro+Cultural",
        descripcion: "Espacio de cine, exposiciones y talleres. Sede del Cine INCAA y del museo histórico local.",
        direccion: "San Martín y Mitre, Tapalqué",
        lat: -36.3547,
        lng: -60.0259,
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Cine+INCAA",
        "https://via.placeholder.com/400x200.png?text=Exposiciones"
        ],
        urlMaps: "https://www.google.com/maps/embed?..."
    }
];