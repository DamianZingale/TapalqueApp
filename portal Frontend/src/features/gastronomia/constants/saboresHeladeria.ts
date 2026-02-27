export const SABORES_HELADERIA = [
  // Clásicos
  'Chocolate',
  'Chocolate blanco',
  'Vainilla',
  'Dulce de leche',
  'Dulce de leche granizado',
  'Crema americana',

  // Frutas
  'Frutilla',
  'Limón',
  'Limón granizado',
  'Naranja',
  'Naranja granizada',
  'Frambuesa',
  'Maracuyá',
  'Mango',
  'Ananá',
  'Durazno',
  'Pera',
  'Cereza',
  'Arándano',
  'Pomelo',
  'Banana',
  'Frutas del bosque',
  'Banana split',

  // Con mezclas y especiales
  'Menta granizada',
  'Menta chip',
  'Sambayón',
  'Tramontana',
  'Coco',
  'Pistacho',
  'Avellana',
  'Nuez',
  'Tiramisú',
  'Oreo',
  'Dulce de leche con brownie',
  'Mascarpone',
  'Mascarpone con frutos rojos',
  'Nutella',
  'Maní',
  'Granola',
  'Queso y dulce',
] as const;

export type SaborHeladeria = typeof SABORES_HELADERIA[number];
