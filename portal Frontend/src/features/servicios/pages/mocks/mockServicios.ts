export interface Servicio {
    id: string;
    titulo: string;
    imagenUrl: string;
    descripcion: string;
    direccion: string;
    horarios: string;
    num: string;
    imagenes: string[];
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
}


export const serviciosMock: Servicio[] = [
    {
        id: "servicio-1",
        titulo: "Plomería Tapalqué",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Plomería+Tapalqué",
        descripcion: "Reparación de cañerías, instalación de sanitarios y detección de fugas.",
        direccion: "Calle Sarmiento 112, Tapalqué",
        horarios: "Lunes a Sábados de 08:00 a 18:00hs",
        num: "2283456789",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Grifería",
        "https://via.placeholder.com/400x200.png?text=Sanitarios"
        ],
        facebook: "https://plomero.net.ar/buenos-aires/tapalque.html"
    },
    {
        id: "servicio-2",
        titulo: "Electricista El Rayo",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Electricista+El+Rayo",
        descripcion: "Instalaciones eléctricas, mantenimiento y tableros domiciliarios.",
        direccion: "Av. Belgrano 89, Tapalqué",
        horarios: "Lunes a Viernes de 09:00 a 17:00hs",
        num: "2283555123",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Tablero",
        "https://via.placeholder.com/400x200.png?text=Cableado"
        ],
        facebook: "https://www.facebook.com/ElectricistaELRAYO/photos/"
    },
    {
        id: "servicio-3",
        titulo: "Jardinería Verde Vida",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Jardinería+Verde+Vida",
        descripcion: "Diseño de jardines, poda, mantenimiento y césped.",
        direccion: "Calle Mitre 205, Tapalqué",
        horarios: "Todos los días de 08:00 a 20:00hs",
        num: "2283999777",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Jardín",
        "https://via.placeholder.com/400x200.png?text=Poda"
        ],
        instagram: "https://www.instagram.com/verdevida.jardineria",
        facebook: "https://www.facebook.com/103397735647477/posts/119143930739524/"
    },
    {
        id: "servicio-4",
        titulo: "Masajes y Relax Tapalqué",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Masajes+Tapalqué",
        descripcion: "Masajes terapéuticos, relajación y técnicas de bienestar.",
        direccion: "Av. Eva Perón y Ruta 51, Tapalqué",
        horarios: "Jueves a Domingos de 10:00 a 19:00hs",
        num: "2283888999",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Masajes",
        "https://via.placeholder.com/400x200.png?text=Relax"
        ],
        instagram: "https://www.instagram.com/tapalque.enamora"
    },
    {
        id: "servicio-5",
        titulo: "Mecánica El Taller",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Mecánica+El+Taller",
        descripcion: "Servicio integral para autos y motos. Frenos, aceite, suspensión.",
        direccion: "Ruta 51 km 1.2, Tapalqué",
        horarios: "Lunes a Sábados de 08:30 a 18:30hs",
        num: "2283666444",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Motor",
        "https://via.placeholder.com/400x200.png?text=Suspensión"
        ]
    }
];