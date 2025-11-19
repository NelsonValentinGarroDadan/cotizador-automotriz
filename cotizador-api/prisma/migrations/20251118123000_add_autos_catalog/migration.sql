-- Migration 20251118123000_add_autos_catalog
-- Crea tablas de catálogo de autos y relación con compañías y cotizaciones

CREATE TABLE `autos_marcas` (
  `idmarca` int NOT NULL,
  `descrip` varchar(50) NOT NULL,
  `logo` varchar(100) NOT NULL,
  `orden` tinyint(3) unsigned NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `repuestos` tinyint(4) NOT NULL,
  `predeterminada` tinyint(1) NOT NULL,
  PRIMARY KEY (`idmarca`)
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE `autos_lineas` (
  `idlinea` int NOT NULL,
  `idmarca` int NOT NULL,
  `descrip` varchar(50) NOT NULL,
  `ajuste` decimal(7,2) NOT NULL,
  `dias_nadcon` int(11) NOT NULL,
  `leyenda_nadcon` varchar(50) NOT NULL,
  `seguro` decimal(10,2) NOT NULL,
  `gestion` decimal(10,2) NOT NULL,
  `flete` decimal(10,2) NOT NULL,
  `idpais_fabricacion` int(11) NOT NULL,
  `compra_vence` int(11) NOT NULL,
  `costo_ad_pm` decimal(15,2) NOT NULL,
  `costo_ad_pm_costo` decimal(15,2) NOT NULL,
  `inactivo` tinyint(1) NOT NULL,
  `idgrupo_servicio` int(11) NOT NULL,
  `valor_hora_servicio` decimal(10,2) NOT NULL,
  `precio_backup` decimal(15,2) NOT NULL,
  `valor_dia_chapa` decimal(15,2) NOT NULL,
  `valor_panio_pintura` decimal(15,2) NOT NULL,
  `adicional_pl_valor` int(11) NOT NULL,
  `adicional_pl_porcentaje` int(11) NOT NULL,
  `precios_en_dolares` tinyint(4) NOT NULL,
  `comercial` tinyint(4) NOT NULL,
  `cantidad_mo` int(11) NOT NULL,
  `costo_entrega` int(11) NOT NULL,
  `codigo_salesforce` varchar(30) NOT NULL,
  `impuesto_interno` decimal(15,2) NOT NULL,
  `idtasa` int(11) NOT NULL,
  `idiva` int(11) NOT NULL,
  `idtipocpu` int(11) NOT NULL,
  PRIMARY KEY (`idlinea`),
  KEY `idx_autos_lineas_idmarca` (`idmarca`)
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE `autos_modelos` (
  `idmodelo` int NOT NULL,
  `descrip` varchar(50) NOT NULL,
  `idmarca` int NOT NULL,
  `idlinea` int NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `codigo_viejo` varchar(10) NOT NULL,
  `idtipo` int(11) NOT NULL,
  `idmotor` int(11) NOT NULL,
  `idcombustible` int(11) NOT NULL,
  `idgrupo` int(11) NOT NULL,
  `iva` decimal(10,2) NOT NULL,
  `idimpuesto` int(11) NOT NULL,
  `iibb` decimal(10,2) NOT NULL,
  `costo_ad_pm` decimal(10,2) NOT NULL,
  `costo_ad_pvp` decimal(10,2) NOT NULL,
  `adicional` decimal(10,2) NOT NULL,
  `adicional_pl_valor` int(11) NOT NULL,
  `adicional_pl_porcentaje` int(11) NOT NULL,
  PRIMARY KEY (`idmodelo`),
  KEY `idx_autos_modelos_idmarca` (`idmarca`),
  KEY `idx_autos_modelos_idlinea` (`idlinea`)
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE `autos_versiones` (
  `idversion` int NOT NULL,
  `descrip` varchar(150) NOT NULL,
  `descrip_nadin` varchar(150) NOT NULL,
  `descrip_otra` varchar(150) NOT NULL,
  `idmarca` int NOT NULL,
  `idmodelo` int NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `inactivo` tinyint(1) unsigned NOT NULL,
  `cod_ph` varchar(10) NOT NULL,
  `codigo_viejo` varchar(20) NOT NULL,
  `codigo_acara` varchar(20) NOT NULL,
  `nueva_descrip` varchar(100) NOT NULL,
  `paquetes` text NOT NULL,
  `paquetes2` text NOT NULL,
  `paquetes3` text NOT NULL,
  `ajuste` decimal(7,2) NOT NULL,
  `incentivo_tactico` int(11) NOT NULL,
  `incentivo_tactico_ph` int(11) NOT NULL,
  `adicional_pl_valor` int(11) NOT NULL,
  `adicional_pl_porcentaje` int(11) NOT NULL,
  `no_tomar_usado` tinyint(1) NOT NULL,
  `txt_otro_sistema` varchar(150) NOT NULL,
  `iibb_cordoba_origen` varchar(10) NOT NULL,
  `iibb_cordoba_marca` varchar(10) NOT NULL,
  `iibb_cordoba_tipo` varchar(10) NOT NULL,
  `iibb_cordoba_modelo` varchar(10) NOT NULL,
  `iva` int(11) NOT NULL,
  `equipamiento` text NOT NULL,
  `sfx_ventas` varchar(3) NOT NULL,
  `sfx_produccion` varchar(3) NOT NULL,
  `idtasa` int(11) NOT NULL,
  `gear_box_type` varchar(3) NOT NULL,
  `connected_car` tinyint(1) NOT NULL,
  `servicios_conectados` tinyint(1) NOT NULL,
  `precio_especial` tinyint(1) NOT NULL,
  `companyId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`idversion`),
  KEY `idx_autos_versiones_idmarca` (`idmarca`),
  KEY `idx_autos_versiones_idmodelo` (`idmodelo`),
  KEY `idx_autos_versiones_companyId` (`companyId`)
) DEFAULT CHARSET=utf8mb4;

ALTER TABLE `autos_lineas`
  ADD CONSTRAINT `fk_autos_lineas_marca` FOREIGN KEY (`idmarca`) REFERENCES `autos_marcas` (`idmarca`);

ALTER TABLE `autos_modelos`
  ADD CONSTRAINT `fk_autos_modelos_marca` FOREIGN KEY (`idmarca`) REFERENCES `autos_marcas` (`idmarca`),
  ADD CONSTRAINT `fk_autos_modelos_linea` FOREIGN KEY (`idlinea`) REFERENCES `autos_lineas` (`idlinea`);

ALTER TABLE `autos_versiones`
  ADD CONSTRAINT `fk_autos_versiones_marca` FOREIGN KEY (`idmarca`) REFERENCES `autos_marcas` (`idmarca`),
  ADD CONSTRAINT `fk_autos_versiones_modelo` FOREIGN KEY (`idmodelo`) REFERENCES `autos_modelos` (`idmodelo`);

-- Nuevo campo en quotations para referenciar autos_versiones
ALTER TABLE `quotations`
  ADD COLUMN `vehicleVersionId` int NULL AFTER `vehicleData`,
  ADD KEY `idx_quotations_vehicleVersionId` (`vehicleVersionId`),
  ADD CONSTRAINT `fk_quotations_vehicle_version` FOREIGN KEY (`vehicleVersionId`) REFERENCES `autos_versiones`(`idversion`);
