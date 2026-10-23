-- ============================================================
-- Parqueadero CUL - Esquema de base de datos (MySQL / MariaDB)
-- Es seguro ejecutarlo varias veces: usa IF NOT EXISTS y
-- INSERT IGNORE / ON DUPLICATE KEY, no borra datos existentes.
--
--   mysql -u root -p < database/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS parqueadero_cul
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parqueadero_cul;

-- Usuarios del sistema (administrador / operario)
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  correo        VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol           ENUM('ADMINISTRADOR','OPERARIO') NOT NULL DEFAULT 'OPERARIO',
  creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Configuración general (una sola fila, id = 1)
CREATE TABLE IF NOT EXISTS configuracion_parqueadero (
  id              INT PRIMARY KEY,
  capacidad_total INT NOT NULL DEFAULT 50
) ENGINE=InnoDB;

-- Tarifa por hora según tipo de vehículo
CREATE TABLE IF NOT EXISTS tarifas (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  tipo_vehiculo  VARCHAR(20) NOT NULL UNIQUE,
  tarifa_por_hora DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB;

-- Ingresos y salidas de vehículos
CREATE TABLE IF NOT EXISTS registros_vehiculos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  placa         VARCHAR(10) NOT NULL,
  tipo_vehiculo VARCHAR(20) NOT NULL,
  hora_entrada  DATETIME NOT NULL,
  hora_salida   DATETIME NULL,
  monto_total   DECIMAL(10,2) NULL,
  estado        ENUM('PARQUEADO','FINALIZADO') NOT NULL DEFAULT 'PARQUEADO',
  anulado       TINYINT(1) NOT NULL DEFAULT 0,
  usuario_ingreso_id INT NULL,
  usuario_salida_id  INT NULL,
  INDEX idx_estado (estado),
  INDEX idx_placa_estado (placa, estado),
  INDEX idx_salida (hora_salida)
) ENGINE=InnoDB;

-- "Fotografías" de ocupación por hora (alimentan el módulo predictivo)
CREATE TABLE IF NOT EXISTS ocupacion_historica (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  fecha           DATE NOT NULL,
  hora            TINYINT NOT NULL,            -- 0 a 23
  cupos_ocupados  INT NOT NULL,
  capacidad_total INT NOT NULL,
  UNIQUE KEY uq_fecha_hora (fecha, hora)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Datos iniciales
-- ------------------------------------------------------------
INSERT INTO configuracion_parqueadero (id, capacidad_total) VALUES (1, 50)
  ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tarifas (tipo_vehiculo, tarifa_por_hora) VALUES
  ('CARRO', 3000), ('MOTO', 1500), ('BICICLETA', 500)
  ON DUPLICATE KEY UPDATE tipo_vehiculo = tipo_vehiculo;

-- Usuarios de PRUEBA (cambia estas contraseñas antes de usar en real)
--   admin@parqueadero.com     / Admin123*
--   operario@parqueadero.com  / Operario123*
INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES
  ('Administrador', 'admin@parqueadero.com',
   '$2a$10$HrkosRg9ii0Ze3Evnlzn5enM0JDNgxK2OYAUS2DK93SMpdIh87AgO', 'ADMINISTRADOR'),
  ('Operario', 'operario@parqueadero.com',
   '$2a$10$2qux5nzYuz308DFRDPPPCepyt/2FJNzvZiaT7T7SnsOASNBBdobF2', 'OPERARIO')
  ON DUPLICATE KEY UPDATE correo = correo;
