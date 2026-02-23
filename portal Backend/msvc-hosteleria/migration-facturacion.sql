-- Migración: Agregar soporte para facturación y mínimo de personas
-- Fecha: 2026-02-22
-- Descripción: Agrega campos para configuración de facturación en hospedajes
--              y mínimo de personas a pagar en habitaciones

-- 1. Agregar columnas a la tabla hospedajes
ALTER TABLE hospedajes
ADD COLUMN IF NOT EXISTS permite_facturacion BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tipo_iva VARCHAR(20) DEFAULT 'NO_APLICA';

-- Actualizar registros existentes con valores por defecto
UPDATE hospedajes
SET permite_facturacion = FALSE,
    tipo_iva = 'NO_APLICA'
WHERE permite_facturacion IS NULL;

-- 2. Agregar columna a la tabla habitaciones
ALTER TABLE habitaciones
ADD COLUMN IF NOT EXISTS minimo_personas_a_pagar INTEGER DEFAULT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN hospedajes.permite_facturacion IS 'Indica si el hospedaje permite emitir facturas a los huéspedes';
COMMENT ON COLUMN hospedajes.tipo_iva IS 'Tipo de IVA: INCLUIDO, ADICIONAL, NO_APLICA';
COMMENT ON COLUMN habitaciones.minimo_personas_a_pagar IS 'Mínimo de personas a cobrar cuando tipoPrecio es POR_PERSONA';
