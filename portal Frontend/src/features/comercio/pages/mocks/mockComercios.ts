export interface Comercio {
    id: string;
    titulo: string;
    imagenUrl: string;
    descripcion: string;
    direccion: string;
    horarios: string;
    num: string;
    imagenes: string[];
    urlMaps: string;
}

export const comerciosMock: Comercio[] = [ 
        {
        id: "comercio-1",
        titulo: "Minimercado Yesi",
        imagenUrl: "https://i.pinimg.com/originals/0e/b3/bb/0eb3bb977428d9433ca07741706e83ae.jpg",
        descripcion: "Minimercado con productos de almacén, bebidas y artículos de limpieza.",
        direccion: "Av. Belgrano 123, Tapalqué",
        horarios: "Lunes a Sábados de 08:00 a 20:00hs",
        num: "2281683888",
        imagenes: [
        "https://i.pinimg.com/originals/0e/b3/bb/0eb3bb977428d9433ca07741706e83ae.jpg",
        "https://via.placeholder.com/400x200.png?text=Yesi+Interior"
        ],
        urlMaps: "https://www.google.com/maps/embed?...",
    },
    {
        id: "comercio-2",
        titulo: "Kiosco El Centro",
        imagenUrl: "https://st2.depositphotos.com/1003697/8297/i/450/depositphotos_82978822-stock-photo-supermarket-store-with-vegetables.jpg",
        descripcion: "Kiosco con golosinas, bebidas frías y recargas virtuales.",
        direccion: "San Martín 456, Tapalqué",
        horarios: "Todos los días de 09:00 a 23:00hs",
        num: "2281555777",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Kiosco+Exterior",
        "https://via.placeholder.com/400x200.png?text=Golosinas"
        ],
        urlMaps: "https://www.google.com/maps/embed?...",
    },
    {
        id: "comercio-3",
        titulo: "Ferretería Don Pepe",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Ferreteria",
        descripcion: "Todo para el hogar, herramientas, pinturas y materiales de construcción.",
        direccion: "Calle Mitre 789, Tapalqué",
        horarios: "Lunes a Viernes de 08:30 a 18:30hs",
        num: "2281444999",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Herramientas",
        "https://via.placeholder.com/400x200.png?text=Don+Pepe"
        ],
        urlMaps: "https://www.google.com/maps/embed?...",
    },
    {
        id: "comercio-4",
        titulo: "Vinoteca La Abadía",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Vinoteca+La+Abadía",
        descripcion: "Selección de vinos, licores y bebidas premium.",
        direccion: "Av. 9 de Julio 321, Tapalqué",
        horarios: "Lunes a Sábados de 10:00 a 21:00hs",
        num: "2281333444",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Vinos",
        "https://via.placeholder.com/400x200.png?text=La+Abadía"
        ],
        urlMaps: "https://www.google.com/maps/embed?...",
    },
    {
        id: "comercio-5",
        titulo: "Calzados Soulier",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Calzados+Soulier",
        descripcion: "Zapatería con calzado urbano, deportivo y escolar.",
        direccion: "Calle Rivadavia 210, Tapalqué",
        horarios: "Lunes a Sábados de 09:30 a 19:30hs",
        num: "2281222333",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Zapatos",
        "https://via.placeholder.com/400x200.png?text=Soulier"
        ],
        urlMaps: "https://www.google.com/maps/embed?...",
    },
    {
        id: "comercio-6",
        titulo: "Panadería Fulco",
        imagenUrl: "https://via.placeholder.com/400x200.png?text=Panadería+Fulco",
        descripcion: "Panadería tradicional con facturas, pan casero y tortas.",
        direccion: "Calle Sarmiento 98, Tapalqué",
        horarios: "Todos los días de 07:00 a 20:00hs",
        num: "2281999888",
        imagenes: [
        "https://via.placeholder.com/400x200.png?text=Pan+Casero",
        "https://via.placeholder.com/400x200.png?text=Fulco"
        ],
        urlMaps: "https://www.google.com/maps/embed?...",
    }

];