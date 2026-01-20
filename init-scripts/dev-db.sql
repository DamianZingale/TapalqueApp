-- Base de datos unificada para desarrollo optimizado
-- Todas las tablas en una sola base de datos para reducir consumo de RAM

-- CREATE DATABASE IF NOT EXISTS tapalque_dev;
-- USE tapalque_dev;

-- Tabla de usuarios (simplificada)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'MODERADOR', 'ADMIN') DEFAULT 'USER',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de comercios (simplificada)
CREATE TABLE IF NOT EXISTS comercios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    direccion VARCHAR(500),
    horario VARCHAR(200),
    telefono VARCHAR(50),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    facebook VARCHAR(255),
    instagram VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de servicios (simplificada)
CREATE TABLE IF NOT EXISTS servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    direccion VARCHAR(500),
    horario VARCHAR(200),
    telefono VARCHAR(50),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    facebook VARCHAR(255),
    instagram VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de imágenes (compartida para todos los servicios)
CREATE TABLE IF NOT EXISTS imagenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entidad_tipo ENUM('comercio', 'servicio', 'gastronomia', 'hospedaje', 'evento', 'terma', 'espacio') NOT NULL,
    entidad_id INT NOT NULL,
    imagen_url VARCHAR(500) NOT NULL,
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entidad (entidad_tipo, entidad_id)
);

-- Insertar datos de prueba básicos
INSERT IGNORE INTO users (username, email, password, role) VALUES 
('admin', 'admin@tapalque.com', '$2a$10$example.hash.here', 'ADMIN'),
('moderador', 'mod@tapalque.com', '$2a$10$example.hash.here', 'MODERADOR'),
('user', 'user@tapalque.com', '$2a$10$example.hash.here', 'USER');

INSERT IGNORE INTO comercios (titulo, descripcion, direccion, telefono) VALUES 
('Comercio de Prueba 1', 'Descripción del comercio de prueba', 'Av. Principal 123', '2215-123456'),
('Comercio de Prueba 2', 'Otro comercio de ejemplo', 'Calle Secundaria 456', '2215-654321');

INSERT IGNORE INTO servicios (titulo, descripcion, direccion, telefono) VALUES 
('Servicio de Prueba 1', 'Descripción del servicio de prueba', 'Servicios St. 789', '2215-789012'),
('Servicio de Prueba 2', 'Otro servicio de ejemplo', 'Ayuda Av. 321', '2215-210987');