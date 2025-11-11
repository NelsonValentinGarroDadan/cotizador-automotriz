/*
  Warnings:

  - You are about to drop the `plan_coefficients` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `plan_coefficients` DROP FOREIGN KEY `plan_coefficients_planVersionId_fkey`;

-- AlterTable
ALTER TABLE `plan_versions` ADD COLUMN `desdeCuota` INTEGER NULL,
    ADD COLUMN `desdeMonto` DECIMAL(12, 2) NULL,
    ADD COLUMN `hastaCuota` INTEGER NULL,
    ADD COLUMN `hastaMonto` DECIMAL(12, 2) NULL;

-- DropTable
DROP TABLE `plan_coefficients`;

-- CreateTable
CREATE TABLE `PlanCoefficient` (
    `id` VARCHAR(191) NOT NULL,
    `planVersionId` VARCHAR(36) NOT NULL,
    `plazo` INTEGER NOT NULL,
    `tna` DECIMAL(5, 3) NOT NULL,
    `coeficiente` DECIMAL(10, 4) NOT NULL,
    `quebrantoFinanciero` DECIMAL(10, 4) NOT NULL,
    `cuotaBalon6M` DECIMAL(10, 2) NULL,
    `cuotaBalon12M` DECIMAL(10, 2) NULL,
    `cuotaBalon18M` DECIMAL(10, 2) NULL,
    `cuotaBalon24M` DECIMAL(10, 2) NULL,
    `cuotaBalon30M` DECIMAL(10, 2) NULL,
    `cuotaBalon36M` DECIMAL(10, 2) NULL,
    `cuotaBalon42M` DECIMAL(10, 2) NULL,
    `cuotaBalon48M` DECIMAL(10, 2) NULL,
    `cuotaPromedio` DECIMAL(10, 2) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PlanCoefficient` ADD CONSTRAINT `PlanCoefficient_planVersionId_fkey` FOREIGN KEY (`planVersionId`) REFERENCES `plan_versions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
