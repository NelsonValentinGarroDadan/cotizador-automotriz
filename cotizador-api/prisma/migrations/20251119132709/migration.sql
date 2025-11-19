-- DropForeignKey
ALTER TABLE `autos_lineas` DROP FOREIGN KEY `autos_lineas_idmarca_fkey`;

-- DropForeignKey
ALTER TABLE `autos_modelos` DROP FOREIGN KEY `autos_modelos_idlinea_fkey`;

-- DropForeignKey
ALTER TABLE `autos_modelos` DROP FOREIGN KEY `autos_modelos_idmarca_fkey`;

-- DropForeignKey
ALTER TABLE `autos_versiones` DROP FOREIGN KEY `autos_versiones_idmarca_fkey`;

-- DropForeignKey
ALTER TABLE `autos_versiones` DROP FOREIGN KEY `autos_versiones_idmodelo_fkey`;

-- DropIndex
DROP INDEX `autos_lineas_idmarca_fkey` ON `autos_lineas`;

-- DropIndex
DROP INDEX `autos_modelos_idlinea_fkey` ON `autos_modelos`;

-- DropIndex
DROP INDEX `autos_modelos_idmarca_fkey` ON `autos_modelos`;

-- DropIndex
DROP INDEX `autos_versiones_idmarca_fkey` ON `autos_versiones`;

-- DropIndex
DROP INDEX `autos_versiones_idmodelo_fkey` ON `autos_versiones`;

-- AddForeignKey
ALTER TABLE `autos_lineas` ADD CONSTRAINT `autos_lineas_idmarca_fkey` FOREIGN KEY (`idmarca`) REFERENCES `autos_marcas`(`idmarca`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `autos_modelos` ADD CONSTRAINT `autos_modelos_idmarca_fkey` FOREIGN KEY (`idmarca`) REFERENCES `autos_marcas`(`idmarca`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `autos_modelos` ADD CONSTRAINT `autos_modelos_idlinea_fkey` FOREIGN KEY (`idlinea`) REFERENCES `autos_lineas`(`idlinea`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `autos_versiones` ADD CONSTRAINT `autos_versiones_idmarca_fkey` FOREIGN KEY (`idmarca`) REFERENCES `autos_marcas`(`idmarca`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `autos_versiones` ADD CONSTRAINT `autos_versiones_idmodelo_fkey` FOREIGN KEY (`idmodelo`) REFERENCES `autos_modelos`(`idmodelo`) ON DELETE RESTRICT ON UPDATE CASCADE;
