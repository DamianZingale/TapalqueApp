CREATE DATABASE IF NOT EXISTS servicios;
USE servicios;

-- Tabla de servicios
CREATE TABLE IF NOT EXISTS servicio (
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

-- Tabla de imágenes de servicios
CREATE TABLE IF NOT EXISTS servicio_imagen (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    imagen_url VARCHAR(500) NOT NULL,
    servicio_id BIGINT,
    FOREIGN KEY (servicio_id) REFERENCES servicio(id) ON DELETE CASCADE
);

-- Datos de ejemplo - Servicios de Tapalqué
INSERT INTO servicio (titulo, descripcion, direccion, horario, telefono, latitud, longitud, facebook, instagram) VALUES
('Taller Mecánico Los Hermanos', 'Servicio mecánico integral para automóviles y camionetas. Especialistas en motores diesel y nafta. Service oficial.', 'Ruta 51 Km 2, Tapalqué', 'Lunes a Viernes 8:00 - 18:00, Sábados 8:00 - 12:00', '2283-421001', -36.3600, -60.0180, 'tallerloshermanos', 'taller_los_hermanos'),
('Veterinaria Rural Tapalqué', 'Atención de grandes y pequeños animales. Servicio a domicilio para establecimientos rurales. Vacunaciones y cirugías.', 'Calle Mitre 180, Tapalqué', 'Lunes a Sábado 9:00 - 13:00 y 17:00 - 20:00', '2283-421002', -36.3555, -60.0215, 'vetruraltp', 'vet_rural_tapalque'),
('Electricidad García', 'Instalaciones eléctricas domiciliarias e industriales. Tableros, automatización y energía solar. Presupuestos sin cargo.', 'Av. San Martín 520, Tapalqué', 'Lunes a Viernes 8:00 - 12:00 y 15:00 - 19:00', '2283-421003', -36.3570, -60.0240, 'electricidadgarcia', 'electricidad_garcia');

-- Imágenes de servicios
INSERT INTO servicio_imagen (imagen_url, servicio_id) VALUES
('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800', 1),
('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800', 1),
('https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800', 2),
('https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800', 2),
('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', 3),
('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 3);
