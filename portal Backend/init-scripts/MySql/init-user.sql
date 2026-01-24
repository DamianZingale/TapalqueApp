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
-- NOTA: Los roles y el usuario moderador se crean
-- automaticamente via DataInitializer en msvc-user
-- usando variables de entorno del archivo .env
-- =====================

