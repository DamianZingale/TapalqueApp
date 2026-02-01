-- Forzar UTF-8 para caracteres especiales (ñ, acentos, etc.)
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS comercio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE comercio;

-- Tabla de comercios
CREATE TABLE IF NOT EXISTS comercio (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    direccion VARCHAR(255),
    horario VARCHAR(255),
    telefono VARCHAR(50),
    latitud DOUBLE,
    longitud DOUBLE,
    facebook VARCHAR(255),
    instagram VARCHAR(255)
);

-- Tabla de imágenes de comercios
CREATE TABLE IF NOT EXISTS comercio_imagen (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    imagen_url VARCHAR(500) NOT NULL,
    comercio_id BIGINT,
    FOREIGN KEY (comercio_id) REFERENCES comercio(id) ON DELETE CASCADE
);

-- Datos de ejemplo - Comercios de Tapalqué
INSERT INTO comercio (titulo, descripcion, direccion, horario, telefono, latitud, longitud, facebook, instagram) VALUES
('Almacén Don José', 'Almacén de ramos generales con productos regionales y artesanales de la zona. Atención personalizada desde 1985.', 'Av. San Martín 450, Tapalqué', 'Lunes a Sábado 8:00 - 20:00', '2283-420001', -36.3567, -60.0225, 'almacendonjose', 'almacen_donjose'),
('Ferretería El Constructor', 'Todo para la construcción y el hogar. Herramientas, pinturas, materiales de construcción y artículos de ferretería en general.', 'Calle Belgrano 230, Tapalqué', 'Lunes a Viernes 8:00 - 12:30 y 16:00 - 20:00, Sábados 8:00 - 13:00', '2283-420002', -36.3580, -60.0210, 'ferreteriaelconstructor', 'ferreteria_constructor'),
('Boutique Moda Campo', 'Indumentaria para toda la familia. Ropa de trabajo, vestimenta rural y moda urbana. Calzado y accesorios.', 'Av. San Martín 320, Tapalqué', 'Lunes a Sábado 9:00 - 13:00 y 17:00 - 21:00', '2283-420003', -36.3562, -60.0230, 'modacampotapalque', 'moda_campo_tapalque');

-- Imágenes de comercios (URLs de ejemplo de Unsplash)
INSERT INTO comercio_imagen (imagen_url, comercio_id) VALUES
('https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800', 1),
('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800', 1),
('https://images.unsplash.com/photo-1581092160607-ee22731c8a66?w=800', 2),
('https://images.unsplash.com/photo-1567449303078-57ad995bd327?w=800', 2),
('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', 3),
('https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800', 3);
