-- Migración 01: permite ANULAR registros en lugar de borrarlos.
-- Ejecutar UNA vez sobre la base existente (parqueadero_cul) desde phpMyAdmin > SQL.
-- Es seguro repetirla: en MariaDB (XAMPP) no falla si la columna ya existe.
ALTER TABLE registros_vehiculos
  ADD COLUMN IF NOT EXISTS anulado TINYINT(1) NOT NULL DEFAULT 0;
