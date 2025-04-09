-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS portal_tpq_hosteleria_db;
USE portal_tpq_hosteleria_db;

-- Crear tabla principal de hospedajes
CREATE TABLE hospedajes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    description TEXT,
    ubicacion VARCHAR(255) NOT NULL,
    google_maps_url VARCHAR(500),
    num_whatsapp VARCHAR(50),
    tipo_hospedaje ENUM('HOTEL', 'DEPARTAMENTO', 'CABAÑA', 'CASA', 'OTRO') NOT NULL
);

-- Crear tabla de imágenes del hospedaje
CREATE TABLE hospedaje_imagen (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospedaje_id BIGINT NOT NULL,
    imagen_url VARCHAR(500) NOT NULL,
    FOREIGN KEY (hospedaje_id) REFERENCES hospedajes(id) ON DELETE CASCADE
);