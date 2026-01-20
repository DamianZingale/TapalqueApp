CREATE DATABASE IF NOT EXISTS termas;
USE termas;

-- Tabla de termas
CREATE TABLE IF NOT EXISTS terma (
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

-- Tabla de imágenes de termas
CREATE TABLE IF NOT EXISTS terma_imagen (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    imagen_url VARCHAR(500) NOT NULL,
    terma_id BIGINT,
    FOREIGN KEY (terma_id) REFERENCES terma(id) ON DELETE CASCADE
);

-- Datos de ejemplo - Termas cercanas a Tapalqué (precio $1 para pruebas)
INSERT INTO terma (titulo, descripcion, direccion, horario, telefono, latitud, longitud, facebook, instagram) VALUES
('Termas del Salado', 'Complejo termal con aguas mineromedicinales. Piletas climatizadas, spa y servicios de masajes. Ideal para relajación y tratamientos de salud. Entrada: $1', 'Ruta Provincial 30 Km 15, Partido de Tapalqué', 'Todos los días 9:00 - 21:00', '2283-422001', -36.3200, -60.0500, 'termasdelsalado', 'termas_del_salado');

-- Imágenes de termas
INSERT INTO terma_imagen (imagen_url, terma_id) VALUES
('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', 1),
('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', 1);
