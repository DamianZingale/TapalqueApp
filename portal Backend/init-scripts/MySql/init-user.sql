CREATE DATABASE IF NOT EXISTS user;
USE user;

-- =====================
-- TABLA ROLES
-- =====================
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- =====================
-- ROLES BASE
-- =====================
INSERT INTO roles (id, name) VALUES
    (1, 'MODERADOR'),
    (2, 'ADMINISTRADOR'),
    (3, 'USER')
ON DUPLICATE KEY UPDATE name = name;



