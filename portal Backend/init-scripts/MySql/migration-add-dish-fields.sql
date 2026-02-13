-- =====================================================
-- MIGRACIÓN: Agregar campos description y available a dish
-- =====================================================

USE gastronomia_db;

-- Agregar columna description
ALTER TABLE dish
ADD COLUMN IF NOT EXISTS description VARCHAR(500) NULL;

-- Agregar columna available con valor por defecto TRUE
ALTER TABLE dish
ADD COLUMN IF NOT EXISTS available BOOLEAN NOT NULL DEFAULT TRUE;

-- Verificar los cambios
DESCRIBE dish;
