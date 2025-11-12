/*
  Warnings:

  - You are about to drop the column `cuotaBalon12M` on the `plancoefficient` table. All the data in the column will be lost.
  - You are about to drop the column `cuotaBalon18M` on the `plancoefficient` table. All the data in the column will be lost.
  - You are about to drop the column `cuotaBalon24M` on the `plancoefficient` table. All the data in the column will be lost.
  - You are about to drop the column `cuotaBalon30M` on the `plancoefficient` table. All the data in the column will be lost.
  - You are about to drop the column `cuotaBalon36M` on the `plancoefficient` table. All the data in the column will be lost.
  - You are about to drop the column `cuotaBalon42M` on the `plancoefficient` table. All the data in the column will be lost.
  - You are about to drop the column `cuotaBalon48M` on the `plancoefficient` table. All the data in the column will be lost.
  - You are about to drop the column `cuotaBalon6M` on the `plancoefficient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `plancoefficient` DROP COLUMN `cuotaBalon12M`,
    DROP COLUMN `cuotaBalon18M`,
    DROP COLUMN `cuotaBalon24M`,
    DROP COLUMN `cuotaBalon30M`,
    DROP COLUMN `cuotaBalon36M`,
    DROP COLUMN `cuotaBalon42M`,
    DROP COLUMN `cuotaBalon48M`,
    DROP COLUMN `cuotaBalon6M`,
    ADD COLUMN `cuotaBalon` DECIMAL(10, 2) NULL;

-- CreateTable
CREATE TABLE `cuota_balon_months` (
    `id` VARCHAR(191) NOT NULL,
    `planCoefficientId` VARCHAR(191) NOT NULL,
    `month` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cuota_balon_months` ADD CONSTRAINT `cuota_balon_months_planCoefficientId_fkey` FOREIGN KEY (`planCoefficientId`) REFERENCES `PlanCoefficient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
