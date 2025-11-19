/*
  Warnings:

  - You are about to alter the column `orden` on the `autos_marcas` table. The data in that column could be lost. The data in that column will be cast from `UnsignedTinyInt` to `Int`.
  - You are about to drop the column `companyId` on the `autos_versiones` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `autos_lineas` DROP FOREIGN KEY `fk_autos_lineas_marca`;

-- DropForeignKey
ALTER TABLE `autos_modelos` DROP FOREIGN KEY `fk_autos_modelos_linea`;

-- DropForeignKey
ALTER TABLE `autos_modelos` DROP FOREIGN KEY `fk_autos_modelos_marca`;

-- DropForeignKey
ALTER TABLE `autos_versiones` DROP FOREIGN KEY `fk_autos_versiones_marca`;

-- DropForeignKey
ALTER TABLE `autos_versiones` DROP FOREIGN KEY `fk_autos_versiones_modelo`;

-- DropForeignKey
ALTER TABLE `quotations` DROP FOREIGN KEY `fk_quotations_vehicle_version`;

-- DropIndex
DROP INDEX `idx_autos_lineas_idmarca` ON `autos_lineas`;

-- DropIndex
DROP INDEX `idx_autos_modelos_idlinea` ON `autos_modelos`;

-- DropIndex
DROP INDEX `idx_autos_modelos_idmarca` ON `autos_modelos`;

-- DropIndex
DROP INDEX `idx_autos_versiones_companyId` ON `autos_versiones`;

-- DropIndex
DROP INDEX `idx_autos_versiones_idmarca` ON `autos_versiones`;

-- DropIndex
DROP INDEX `idx_autos_versiones_idmodelo` ON `autos_versiones`;

-- AlterTable
ALTER TABLE `autos_lineas` MODIFY `inactivo` INTEGER NOT NULL,
    MODIFY `precios_en_dolares` INTEGER NOT NULL,
    MODIFY `comercial` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `autos_marcas` MODIFY `orden` INTEGER NOT NULL,
    MODIFY `repuestos` INTEGER NOT NULL,
    MODIFY `predeterminada` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `autos_versiones` DROP COLUMN `companyId`,
    MODIFY `inactivo` INTEGER NOT NULL,
    MODIFY `no_tomar_usado` INTEGER NOT NULL,
    MODIFY `connected_car` INTEGER NOT NULL,
    MODIFY `servicios_conectados` INTEGER NOT NULL,
    MODIFY `precio_especial` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `_CompanyVehicles` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `_CompanyVehicles_AB_unique`(`A`, `B`),
    INDEX `_CompanyVehicles_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_vehicleVersionId_fkey` FOREIGN KEY (`vehicleVersionId`) REFERENCES `autos_versiones`(`idversion`) ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE `_CompanyVehicles` ADD CONSTRAINT `_CompanyVehicles_A_fkey` FOREIGN KEY (`A`) REFERENCES `autos_versiones`(`idversion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CompanyVehicles` ADD CONSTRAINT `_CompanyVehicles_B_fkey` FOREIGN KEY (`B`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `quotations_vehicleVersionId_idx` ON `quotations`(`vehicleVersionId`);
DROP INDEX `idx_quotations_vehicleVersionId` ON `quotations`;
