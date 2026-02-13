-- Forzar UTF-8 para caracteres especiales (ñ, acentos, etc.)
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS espacios_publicos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE espacios_publicos;

-- Tabla de espacios públicos
CREATE TABLE IF NOT EXISTS espacio_publico (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    direccion VARCHAR(255),
    telefono VARCHAR(50),
    latitud DOUBLE,
    longitud DOUBLE,
    facebook VARCHAR(255),
    instagram VARCHAR(255),
    twitter VARCHAR(255),
    tiktok VARCHAR(255),
    categoria VARCHAR(100),
    horario VARCHAR(255)
);

-- Tabla de imágenes de espacios públicos
CREATE TABLE IF NOT EXISTS espacio_publico_imagen (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    imagen_url VARCHAR(500) NOT NULL,
    espacio_publico_id BIGINT,
    FOREIGN KEY (espacio_publico_id) REFERENCES espacio_publico(id) ON DELETE CASCADE
);

-- Datos de ejemplo - Espacios públicos de Tapalqué
INSERT INTO espacio_publico (titulo, descripcion, direccion, telefono, latitud, longitud, facebook, instagram, twitter, tiktok, categoria, horario) VALUES
('Plaza San Martín', 'Plaza principal de Tapalqué. Espacio verde con juegos infantiles, bancos y monumento al Libertador. Punto de encuentro tradicional de la comunidad.', 'Av. San Martín y Belgrano, Tapalqué', '2283-420000', -36.3565, -60.0220, 'municipalidadtapalque', 'muni_tapalque', NULL, NULL, 'Plaza', 'Abierto las 24 horas'),
('Laguna de Tapalqué', 'Laguna natural ideal para pesca deportiva y avistaje de aves. Área de picnic y senderos peatonales. Fauna autóctona de la pampa húmeda.', 'Camino a la Laguna s/n, Tapalqué', '2283-420000', -36.3700, -60.0400, 'lagunatapalque', 'laguna_tapalque', NULL, NULL, 'Reserva Natural', 'Amanecer a atardecer'),
('Museo Histórico Regional', 'Museo con colección de historia local, cultura gaucha y arqueología regional. Exposiciones permanentes y temporales sobre la vida rural pampeana.', 'Calle Rivadavia 150, Tapalqué', '2283-424001', -36.3560, -60.0235, 'museohistoricotapalque', 'museo_tapalque', NULL, NULL, 'Museo', 'Martes a Domingo 10:00 - 18:00');

-- Imágenes de espacios públicos
INSERT INTO espacio_publico_imagen (imagen_url, espacio_publico_id) VALUES
('https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800', 1),
('https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800', 1),
('https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800', 2),
('https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', 2),
('https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800', 3),
('https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800', 3);
