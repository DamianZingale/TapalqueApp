-- Forzar UTF-8 para caracteres especiales (ñ, acentos, etc.)
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS user CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE user;

-- =====================
-- TABLA ROLES
-- =====================
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- =====================
-- TABLA USUARIOS
-- =====================
CREATE TABLE IF NOT EXISTS usuarios_tb (
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    email_verified BIT(1) NOT NULL DEFAULT 0,
    activo BIT(1) NOT NULL DEFAULT 1,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) DEFAULT NULL,
    name_emprise VARCHAR(255) DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    registration_date DATETIME(6) DEFAULT NULL,
    verification_token VARCHAR(255) DEFAULT NULL,
    verification_token_expiry DATETIME(6) DEFAULT NULL,
    roles_id BIGINT DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY UK_email (email),
    KEY FK_roles (roles_id),
    CONSTRAINT FK_usuarios_roles FOREIGN KEY (roles_id) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================
-- TABLA BUSINESS
-- =====================
CREATE TABLE IF NOT EXISTS business_tb (
    id BIGINT NOT NULL AUTO_INCREMENT,
    business_type ENUM('HOSPEDAJE','RESTAURANT') NOT NULL,
    external_business_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    owner_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    KEY FK_business_owner (owner_id),
    CONSTRAINT FK_business_usuarios FOREIGN KEY (owner_id) REFERENCES usuarios_tb (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================
-- TABLA HOME_CONFIG (Configuración de imágenes del Home)
-- =====================
CREATE TABLE IF NOT EXISTS home_config (
    id BIGINT NOT NULL AUTO_INCREMENT,
    seccion VARCHAR(50) NOT NULL UNIQUE,
    imagen_url VARCHAR(500),
    titulo VARCHAR(255),
    activo BIT(1) NOT NULL DEFAULT 1,
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Datos iniciales de configuración del Home
INSERT INTO home_config (seccion, imagen_url, titulo, activo) VALUES
('COMERCIO', NULL, 'Comercios', 1),
('GASTRONOMIA', NULL, 'Gastronomía', 1),
('HOSPEDAJE', NULL, 'Hospedajes', 1),
('SERVICIOS', NULL, 'Servicios', 1),
('ESPACIOS', NULL, 'Espacios Públicos', 1),
('EVENTOS', NULL, 'Eventos', 1),
('TERMAS', NULL, 'Termas', 1)
ON DUPLICATE KEY UPDATE seccion = seccion;

-- =====================
-- NOTA: Los roles y el usuario moderador se crean
-- automaticamente via DataInitializer en msvc-user
-- usando variables de entorno del archivo .env
-- =====================

