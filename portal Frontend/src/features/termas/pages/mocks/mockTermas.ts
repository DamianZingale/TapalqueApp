export interface Termas {
  id: string;
  titulo: string;
  imagenUrl: string;
  descripcion: string;
  direccion: string;
  horarios: string;
  servicios: string[];
  imagenes: string[];
  urlMaps: string;
  urlWeb?: string;
  num: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
}

export const termasMock: Termas[] = [
  {
    id: 'termas-1',
    titulo: 'Complejo Termas Tapalqué',
    imagenUrl: 'https://via.placeholder.com/400x200.png?text=Termas+Tapalqué',
    descripcion:
      'Ubicado en un entorno natural de 17 hectáreas, el complejo ofrece piscinas termales cubiertas, spa, masajes, vestuarios y zona gastronómica. Las aguas brotan desde 441 metros de profundidad y tienen propiedades terapéuticas.',
    direccion: 'Av. Eva Perón y Ruta 51, Tapalqué',
    horarios: 'Jueves a domingos y feriados, de 10:00 a 18:00hs',
    servicios: [
      'Piscinas termales cubiertas',
      'Masajes y técnicas de relax',
      'Vestuarios y duchas',
      'Alquiler de batas, reposeras y sombrillas',
      'Servicio de enfermería',
      'Zona gastronómica y patio comercial',
    ],
    imagenes: [
      'https://termastapalque.com.ar/wp-content/uploads/2023/07/piletas05-64c75292cd7ed.webp',
      'https://media.urgente24.com/p/0ddc5ff4c5061f0fd86e729a66ef63eb/adjuntos/319/imagenes/002/890/0002890817/1jpg.jpg',
      'https://www.tiempoar.com.ar/wp-content/uploads/2023/07/tapalque-complejo-termal-paseo-comercial-2-scaled.jpg',
    ],
    urlMaps: `https://www.google.com/maps?q=${-36.348803},${-60.007554}`,
    urlWeb: 'https://termastapalque.com.ar/',
    num: '2281656585',
    facebook: 'https://www.facebook.com/municipalidadtapalque',
    instagram: 'https://www.instagram.com/tapalque.enamora',
  },
];
