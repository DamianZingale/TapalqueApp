CREATE DATABASE IF NOT EXISTS hosteleria;
USE hosteleria;

-- Tabla de hospedajes
CREATE TABLE IF NOT EXISTS hospedajes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    description TEXT,
    ubicacion VARCHAR(255),
    google_maps_url VARCHAR(500),
    num_whatsapp VARCHAR(50),
    tipo_hospedaje ENUM('HOTEL', 'DEPARTAMENTO', 'CABAÑA', 'CASA', 'OTRO') NOT NULL
);

-- Tabla de imágenes de hospedajes
CREATE TABLE IF NOT EXISTS hospedaje_imagen (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    imagen_url VARCHAR(500) NOT NULL,
    hospedaje_id BIGINT,
    FOREIGN KEY (hospedaje_id) REFERENCES hospedajes(id) ON DELETE CASCADE
);

-- Datos de ejemplo - Hospedajes de Tapalqué (precios $1 para pruebas)
INSERT INTO hospedajes (titulo, description, ubicacion, google_maps_url, num_whatsapp, tipo_hospedaje) VALUES
('Hotel Plaza Tapalqué', 'Hotel céntrico con habitaciones dobles y familiares. Desayuno incluido, WiFi, estacionamiento. A pasos de la plaza principal. Precio por noche: $1', 'Av. San Martín 400, Tapalqué', 'https://maps.google.com/?q=-36.3565,-60.0220', '+542283425001', 'HOTEL'),
('Cabañas del Campo', 'Cabañas de campo totalmente equipadas. Parrilla, pileta, quincho. Ideal para familias y grupos. Tranquilidad a 5km del centro. Precio por noche: $1', 'Camino Rural Km 5, Tapalqué', 'https://maps.google.com/?q=-36.3800,-60.0500', '+542283425002', 'CABAÑA'),
('Departamento Céntrico', 'Departamento de 2 ambientes en pleno centro. Cocina equipada, aire acondicionado, TV cable. Ideal para parejas o viajeros solos. Precio por noche: $1', 'Calle Belgrano 150, Tapalqué', 'https://maps.google.com/?q=-36.3570,-60.0210', '+542283425003', 'DEPARTAMENTO');

-- Imágenes de hospedajes
INSERT INTO hospedaje_imagen (imagen_url, hospedaje_id) VALUES
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1),
('https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', 1),
('https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800', 2),
('https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800', 2),
('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 3),
('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 3);
