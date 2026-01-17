CREATE DATABASE IF NOT EXISTS gastronomia;
USE gastronomia;

-- Tabla de categorías de restaurantes
CREATE TABLE IF NOT EXISTS category (
    id_category BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Tabla de restaurantes
CREATE TABLE IF NOT EXISTS restaurant (
    id_restaurant BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    delivery BOOLEAN NOT NULL DEFAULT FALSE,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL
);

-- Relación restaurante-categoría
CREATE TABLE IF NOT EXISTS restaurant_category (
    id_restaurant BIGINT,
    id_category BIGINT,
    PRIMARY KEY (id_restaurant, id_category),
    FOREIGN KEY (id_restaurant) REFERENCES restaurant(id_restaurant) ON DELETE CASCADE,
    FOREIGN KEY (id_category) REFERENCES category(id_category) ON DELETE CASCADE
);

-- Tabla de imágenes de restaurantes
CREATE TABLE IF NOT EXISTS restaurant_image (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    restaurant_id BIGINT,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(id_restaurant) ON DELETE CASCADE
);

-- Tabla de horarios
CREATE TABLE IF NOT EXISTS schedule (
    id_schedule BIGINT AUTO_INCREMENT PRIMARY KEY,
    day_of_week VARCHAR(20) NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    restaurant_id BIGINT,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(id_restaurant) ON DELETE CASCADE
);

-- Tabla de teléfonos
CREATE TABLE IF NOT EXISTS phone_number (
    id_phone BIGINT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(50) NOT NULL,
    phone_type ENUM('FIJO', 'CELULAR', 'WHATSAPP') NOT NULL,
    restaurant_id BIGINT,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(id_restaurant) ON DELETE CASCADE
);

-- Tabla de menú
CREATE TABLE IF NOT EXISTS menu (
    id_menu BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    restaurant_id BIGINT UNIQUE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(id_restaurant) ON DELETE CASCADE
);

-- Tabla de categorías de platos
CREATE TABLE IF NOT EXISTS dish_category (
    id_dish_category BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Tabla de restricciones de platos
CREATE TABLE IF NOT EXISTS dish_restriction_type (
    id_restriction BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Tabla de ingredientes
CREATE TABLE IF NOT EXISTS ingredient (
    id_ingredient BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Tabla de platos (precios $1 para pruebas)
CREATE TABLE IF NOT EXISTS dish (
    id_dish BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DOUBLE NOT NULL,
    id_menu BIGINT NOT NULL,
    FOREIGN KEY (id_menu) REFERENCES menu(id_menu) ON DELETE CASCADE
);

-- Relación plato-categoría
CREATE TABLE IF NOT EXISTS dish_category_relation (
    id_dish BIGINT,
    id_dish_category BIGINT,
    PRIMARY KEY (id_dish, id_dish_category),
    FOREIGN KEY (id_dish) REFERENCES dish(id_dish) ON DELETE CASCADE,
    FOREIGN KEY (id_dish_category) REFERENCES dish_category(id_dish_category) ON DELETE CASCADE
);

-- Relación plato-restricción
CREATE TABLE IF NOT EXISTS dish_restriction (
    id_dish BIGINT,
    id_restriction BIGINT,
    PRIMARY KEY (id_dish, id_restriction),
    FOREIGN KEY (id_dish) REFERENCES dish(id_dish) ON DELETE CASCADE,
    FOREIGN KEY (id_restriction) REFERENCES dish_restriction_type(id_restriction) ON DELETE CASCADE
);

-- Relación plato-ingrediente
CREATE TABLE IF NOT EXISTS dish_ingredient (
    id_dish BIGINT,
    id_ingredient BIGINT,
    PRIMARY KEY (id_dish, id_ingredient),
    FOREIGN KEY (id_dish) REFERENCES dish(id_dish) ON DELETE CASCADE,
    FOREIGN KEY (id_ingredient) REFERENCES ingredient(id_ingredient) ON DELETE CASCADE
);

-- =====================================
-- DATOS DE EJEMPLO
-- =====================================

-- Categorías de restaurantes
INSERT INTO category (name) VALUES
('Parrilla'),
('Pizzería'),
('Comida Casera'),
('Cafetería');

-- Restaurantes de Tapalqué
INSERT INTO restaurant (name, address, email, delivery, latitude, longitude) VALUES
('Parrilla Don Gaucho', 'Av. San Martín 600, Tapalqué', 'dongaucho@email.com', TRUE, -36.3560, -60.0215),
('Pizzería La Italiana', 'Calle Belgrano 200, Tapalqué', 'laitaliana@email.com', TRUE, -36.3575, -60.0230),
('Restaurant El Molino', 'Ruta 51 Km 1, Tapalqué', 'elmolino@email.com', FALSE, -36.3590, -60.0180);

-- Relaciones restaurante-categoría
INSERT INTO restaurant_category (id_restaurant, id_category) VALUES
(1, 1), -- Don Gaucho es Parrilla
(2, 2), -- La Italiana es Pizzería
(3, 3), -- El Molino es Comida Casera
(3, 1); -- El Molino también tiene parrilla

-- Imágenes de restaurantes
INSERT INTO restaurant_image (image_url, restaurant_id) VALUES
('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', 1),
('https://images.unsplash.com/photo-1544025162-d76694265947?w=800', 1),
('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 2),
('https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800', 2),
('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', 3),
('https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800', 3);

-- Horarios
INSERT INTO schedule (day_of_week, opening_time, closing_time, restaurant_id) VALUES
('LUNES', '12:00:00', '15:00:00', 1),
('LUNES', '20:00:00', '00:00:00', 1),
('MARTES', '12:00:00', '15:00:00', 1),
('MARTES', '20:00:00', '00:00:00', 1),
('MIERCOLES', '12:00:00', '15:00:00', 1),
('MIERCOLES', '20:00:00', '00:00:00', 1),
('JUEVES', '12:00:00', '15:00:00', 1),
('JUEVES', '20:00:00', '00:00:00', 1),
('VIERNES', '12:00:00', '15:00:00', 1),
('VIERNES', '20:00:00', '01:00:00', 1),
('SABADO', '12:00:00', '15:00:00', 1),
('SABADO', '20:00:00', '01:00:00', 1),
('DOMINGO', '12:00:00', '16:00:00', 1),
('LUNES', '11:00:00', '14:30:00', 2),
('LUNES', '19:00:00', '23:30:00', 2),
('MARTES', '11:00:00', '14:30:00', 2),
('MARTES', '19:00:00', '23:30:00', 2),
('MIERCOLES', '11:00:00', '14:30:00', 2),
('MIERCOLES', '19:00:00', '23:30:00', 2),
('JUEVES', '11:00:00', '14:30:00', 2),
('JUEVES', '19:00:00', '23:30:00', 2),
('VIERNES', '11:00:00', '14:30:00', 2),
('VIERNES', '19:00:00', '00:30:00', 2),
('SABADO', '11:00:00', '14:30:00', 2),
('SABADO', '19:00:00', '00:30:00', 2),
('DOMINGO', '11:00:00', '15:00:00', 2),
('DOMINGO', '19:00:00', '23:00:00', 2),
('VIERNES', '12:00:00', '16:00:00', 3),
('VIERNES', '20:00:00', '00:00:00', 3),
('SABADO', '12:00:00', '16:00:00', 3),
('SABADO', '20:00:00', '00:00:00', 3),
('DOMINGO', '12:00:00', '17:00:00', 3);

-- Teléfonos
INSERT INTO phone_number (number, phone_type, restaurant_id) VALUES
('2283-426001', 'FIJO', 1),
('+542283426001', 'WHATSAPP', 1),
('2283-426002', 'FIJO', 2),
('+542283426002', 'WHATSAPP', 2),
('2283-426003', 'FIJO', 3),
('+542283426003', 'CELULAR', 3);

-- Menús
INSERT INTO menu (name, restaurant_id) VALUES
('Menú Don Gaucho', 1),
('Menú La Italiana', 2),
('Menú El Molino', 3);

-- Categorías de platos
INSERT INTO dish_category (name) VALUES
('Entradas'),
('Carnes'),
('Pastas'),
('Pizzas'),
('Postres'),
('Bebidas'),
('Empanadas');

-- Restricciones de platos
INSERT INTO dish_restriction_type (name) VALUES
('Vegetariano'),
('Vegano'),
('Sin Gluten'),
('Sin Lactosa');

-- Ingredientes
INSERT INTO ingredient (name) VALUES
('Carne Vacuna'),
('Pollo'),
('Cerdo'),
('Queso'),
('Tomate'),
('Cebolla'),
('Lechuga'),
('Jamón'),
('Mozzarella'),
('Aceitunas'),
('Huevo'),
('Harina'),
('Verduras');

-- Platos (todos a $1 para pruebas con MercadoPago)
INSERT INTO dish (name, price, id_menu) VALUES
-- Don Gaucho (Parrilla)
('Asado para 2', 1.00, 1),
('Vacío a la parrilla', 1.00, 1),
('Chorizo criollo', 1.00, 1),
('Empanadas de carne (x6)', 1.00, 1),
('Ensalada mixta', 1.00, 1),
-- La Italiana (Pizzería)
('Pizza Muzzarella', 1.00, 2),
('Pizza Napolitana', 1.00, 2),
('Pizza Fugazzeta', 1.00, 2),
('Fainá', 1.00, 2),
('Empanadas de jamón y queso (x6)', 1.00, 2),
-- El Molino (Comida Casera)
('Milanesa napolitana', 1.00, 3),
('Ravioles caseros', 1.00, 3),
('Pollo al horno con papas', 1.00, 3),
('Tarta de verduras', 1.00, 3),
('Flan casero', 1.00, 3);

-- Relaciones plato-categoría
INSERT INTO dish_category_relation (id_dish, id_dish_category) VALUES
(1, 2), (2, 2), (3, 2), (4, 7), (5, 1),
(6, 4), (7, 4), (8, 4), (9, 4), (10, 7),
(11, 2), (12, 3), (13, 2), (14, 1), (15, 5);

-- Relaciones plato-restricción
INSERT INTO dish_restriction (id_dish, id_restriction) VALUES
(5, 1), (5, 2), -- Ensalada mixta: Vegetariano, Vegano
(9, 1), -- Fainá: Vegetariano
(14, 1); -- Tarta de verduras: Vegetariano

-- Relaciones plato-ingrediente
INSERT INTO dish_ingredient (id_dish, id_ingredient) VALUES
(1, 1), (2, 1), (3, 3), (4, 1), (4, 6),
(5, 7), (5, 5), (5, 6),
(6, 4), (6, 9), (7, 9), (7, 5), (8, 4), (8, 6),
(10, 8), (10, 4),
(11, 1), (11, 4), (11, 5), (12, 12), (12, 4),
(13, 2), (14, 13), (14, 11), (15, 11);
