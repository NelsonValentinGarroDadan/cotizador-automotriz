-- Migration 20251118123000_add_autos_catalog
-- Crea tablas de catálogo de autos con los campos mínimos solicitados
-- (marca, línea, versión) y la relación con compañías y cotizaciones.

CREATE TABLE `autos_marcas` (
  `idmarca` INT NOT NULL,
  `descrip` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`idmarca`)
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE `autos_lineas` (
  `idlinea` INT NOT NULL,
  `idmarca` INT NOT NULL,
  `descrip` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`idlinea`),
  KEY `idx_autos_lineas_idmarca` (`idmarca`)
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE `autos_versiones` (
  `idversion` INT NOT NULL,
  `descrip` VARCHAR(150) NOT NULL,
  `idlinea` INT NOT NULL,
  `codigo` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`idversion`),
  KEY `idx_autos_versiones_idlinea` (`idlinea`)
) DEFAULT CHARSET=utf8mb4;

ALTER TABLE `autos_lineas`
  ADD CONSTRAINT `fk_autos_lineas_marca` FOREIGN KEY (`idmarca`) REFERENCES `autos_marcas` (`idmarca`);

ALTER TABLE `autos_versiones`
  ADD CONSTRAINT `fk_autos_versiones_linea_min` FOREIGN KEY (`idlinea`) REFERENCES `autos_lineas`(`idlinea`);

-- Nuevo campo en quotations para referenciar autos_versiones
ALTER TABLE `quotations`
  ADD COLUMN `vehicleVersionId` INT NULL AFTER `vehicleData`,
  ADD KEY `idx_quotations_vehicleVersionId` (`vehicleVersionId`),
  ADD CONSTRAINT `fk_quotations_vehicle_version` FOREIGN KEY (`vehicleVersionId`) REFERENCES `autos_versiones`(`idversion`);
