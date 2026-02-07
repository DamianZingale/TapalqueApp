-- Migration: Add contact fields to usuarios_tb
-- telefono, dni, direccion

USE user;

-- Add telefono column if not exists
SET @column_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'user'
    AND TABLE_NAME = 'usuarios_tb'
    AND COLUMN_NAME = 'telefono'
);
SET @query = IF(@column_exists = 0,
    'ALTER TABLE usuarios_tb ADD COLUMN telefono VARCHAR(50) DEFAULT NULL',
    'SELECT "Column telefono already exists"'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add dni column if not exists
SET @column_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'user'
    AND TABLE_NAME = 'usuarios_tb'
    AND COLUMN_NAME = 'dni'
);
SET @query = IF(@column_exists = 0,
    'ALTER TABLE usuarios_tb ADD COLUMN dni VARCHAR(20) DEFAULT NULL',
    'SELECT "Column dni already exists"'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add direccion column if not exists
SET @column_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'user'
    AND TABLE_NAME = 'usuarios_tb'
    AND COLUMN_NAME = 'direccion'
);
SET @query = IF(@column_exists = 0,
    'ALTER TABLE usuarios_tb ADD COLUMN direccion VARCHAR(255) DEFAULT NULL',
    'SELECT "Column direccion already exists"'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
