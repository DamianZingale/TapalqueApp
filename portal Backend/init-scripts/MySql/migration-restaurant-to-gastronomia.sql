-- =====================================================
-- MIGRACIÓN: Cambiar RESTAURANT por GASTRONOMIA
-- =====================================================
-- Este script actualiza el enum business_type y los datos existentes
-- para cambiar 'RESTAURANT' por 'GASTRONOMIA'

USE user_db;

-- Paso 1: Modificar el ENUM para incluir ambos valores temporalmente
ALTER TABLE business_tb
MODIFY COLUMN business_type ENUM('HOSPEDAJE','RESTAURANT','GASTRONOMIA') NOT NULL;

-- Paso 2: Actualizar todos los registros existentes
UPDATE business_tb
SET business_type = 'GASTRONOMIA'
WHERE business_type = 'RESTAURANT';

-- Paso 3: Modificar el ENUM para remover 'RESTAURANT'
ALTER TABLE business_tb
MODIFY COLUMN business_type ENUM('HOSPEDAJE','GASTRONOMIA') NOT NULL;

-- Verificar los cambios
SELECT business_type, COUNT(*) as cantidad
FROM business_tb
GROUP BY business_type;
