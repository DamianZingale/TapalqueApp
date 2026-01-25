CREATE DATABASE IF NOT EXISTS eventos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eventos;

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS evento (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_evento VARCHAR(255) NOT NULL,
    lugar VARCHAR(255) NOT NULL,
    horario VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    telefono_contacto VARCHAR(50) NOT NULL,
    nombre_contacto VARCHAR(255) NOT NULL
);

-- Tabla de imágenes de eventos
CREATE TABLE IF NOT EXISTS evento_imagen (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    imagen_url VARCHAR(500) NOT NULL,
    evento_id BIGINT,
    FOREIGN KEY (evento_id) REFERENCES evento(id) ON DELETE CASCADE
);

-- Datos de ejemplo - Eventos de Tapalqué (Entrada $1 para pruebas)
INSERT INTO evento (nombre_evento, lugar, horario, fecha_inicio, fecha_fin, telefono_contacto, nombre_contacto) VALUES
('Fiesta del Ternero', 'Predio Ferial Municipal, Tapalqué', '10:00 - 00:00', '2026-02-15', '2026-02-17', '2283-423001', 'Municipalidad de Tapalqué'),
('Festival Folclórico Pampeano', 'Anfiteatro Municipal, Tapalqué', '20:00 - 02:00', '2026-03-08', '2026-03-09', '2283-423002', 'Secretaría de Cultura'),
('Expo Rural Tapalqué', 'Sociedad Rural, Ruta 51', '09:00 - 19:00', '2026-04-20', '2026-04-22', '2283-423003', 'Sociedad Rural Tapalqué');

-- Imágenes de eventos
INSERT INTO evento_imagen (imagen_url, evento_id) VALUES
('https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800', 1),
('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', 1),
('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 2),
('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800', 2),
('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 3),
('https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800', 3);
