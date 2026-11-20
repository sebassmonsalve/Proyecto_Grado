-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-10-2026 a las 02:36:48
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `parqueadero_cul`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion_parqueadero`
--

CREATE TABLE `configuracion_parqueadero` (
  `id` int(11) NOT NULL,
  `capacidad_total` int(11) NOT NULL DEFAULT 30,
  `nombre_establecimiento` varchar(100) DEFAULT 'Parqueadero Central'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `configuracion_parqueadero`
--

INSERT INTO `configuracion_parqueadero` (`id`, `capacidad_total`, `nombre_establecimiento`) VALUES
(1, 30, 'Parqueadero Central');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ocupacion_historica`
--

CREATE TABLE `ocupacion_historica` (
  `id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora` tinyint(4) NOT NULL,
  `cupos_ocupados` int(11) NOT NULL,
  `capacidad_total` int(11) NOT NULL,
  `creado_en` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_vehiculos`
--

CREATE TABLE `registros_vehiculos` (
  `id` int(11) NOT NULL,
  `placa` varchar(10) NOT NULL,
  `tipo_vehiculo` enum('CARRO','MOTO','BICICLETA') NOT NULL,
  `hora_entrada` datetime NOT NULL DEFAULT current_timestamp(),
  `hora_salida` datetime DEFAULT NULL,
  `monto_total` decimal(10,2) DEFAULT NULL,
  `estado` enum('PARQUEADO','FINALIZADO') DEFAULT 'PARQUEADO',
  `usuario_ingreso_id` int(11) DEFAULT NULL,
  `usuario_salida_id` int(11) DEFAULT NULL,
  `anulado` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registros_vehiculos`
--

INSERT INTO `registros_vehiculos` (`id`, `placa`, `tipo_vehiculo`, `hora_entrada`, `hora_salida`, `monto_total`, `estado`, `usuario_ingreso_id`, `usuario_salida_id`, `anulado`) VALUES
(1, 'KGF-867', 'MOTO', '2026-09-26 21:44:44', '2026-09-26 21:45:08', 1500.00, 'FINALIZADO', NULL, NULL, 0),
(2, 'GHJ-382', 'CARRO', '2026-10-16 21:11:18', '2026-10-16 21:12:05', 3000.00, 'FINALIZADO', NULL, NULL, 0),
(3, 'MARLOM', 'BICICLETA', '2026-10-16 21:15:00', '2026-10-16 21:30:03', 500.00, 'FINALIZADO', NULL, NULL, 1),
(4, 'GFT-676', 'CARRO', '2026-10-16 21:28:52', NULL, NULL, 'PARQUEADO', NULL, NULL, 0),
(5, 'GHD-672', 'MOTO', '2026-10-16 21:29:23', '2026-10-17 14:53:27', 27000.00, 'FINALIZADO', NULL, 2, 0),
(6, 'YO', 'MOTO', '2026-10-17 14:54:13', '2026-10-17 14:54:17', 1500.00, 'FINALIZADO', 2, 2, 1),
(7, 'QWE-989', 'MOTO', '2026-10-22 15:58:55', NULL, NULL, 'PARQUEADO', 2, NULL, 0),
(8, 'TTT-999', 'MOTO', '2026-10-22 17:13:10', NULL, NULL, 'PARQUEADO', 2, NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarifas`
--

CREATE TABLE `tarifas` (
  `id` int(11) NOT NULL,
  `tipo_vehiculo` enum('CARRO','MOTO','BICICLETA') NOT NULL,
  `tarifa_por_hora` decimal(10,2) NOT NULL,
  `tarifa_fraccion` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tarifas`
--

INSERT INTO `tarifas` (`id`, `tipo_vehiculo`, `tarifa_por_hora`, `tarifa_fraccion`) VALUES
(1, 'CARRO', 3000.00, 1000.00),
(2, 'MOTO', 1500.00, 500.00),
(3, 'BICICLETA', 500.00, 0.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('ADMINISTRADOR','OPERARIO') NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `password_hash`, `rol`, `creado_en`) VALUES
(1, 'Administrador', 'admin@parqueadero.com', '$2a$10$HrkosRg9ii0Ze3Evnlzn5enM0JDNgxK2OYAUS2DK93SMpdIh87AgO', 'ADMINISTRADOR', '2026-10-17 01:47:35'),
(2, 'Operario', 'operario@parqueadero.com', '$2a$10$2qux5nzYuz308DFRDPPPCepyt/2FJNzvZiaT7T7SnsOASNBBdobF2', 'OPERARIO', '2026-10-17 01:47:35');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `configuracion_parqueadero`
--
ALTER TABLE `configuracion_parqueadero`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ocupacion_historica`
--
ALTER TABLE `ocupacion_historica`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `registros_vehiculos`
--
ALTER TABLE `registros_vehiculos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_ingreso_id` (`usuario_ingreso_id`),
  ADD KEY `usuario_salida_id` (`usuario_salida_id`);

--
-- Indices de la tabla `tarifas`
--
ALTER TABLE `tarifas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `configuracion_parqueadero`
--
ALTER TABLE `configuracion_parqueadero`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `ocupacion_historica`
--
ALTER TABLE `ocupacion_historica`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `registros_vehiculos`
--
ALTER TABLE `registros_vehiculos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `tarifas`
--
ALTER TABLE `tarifas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `registros_vehiculos`
--
ALTER TABLE `registros_vehiculos`
  ADD CONSTRAINT `registros_vehiculos_ibfk_1` FOREIGN KEY (`usuario_ingreso_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `registros_vehiculos_ibfk_2` FOREIGN KEY (`usuario_salida_id`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
