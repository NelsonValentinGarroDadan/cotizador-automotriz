-- AlterTable
ALTER TABLE `Plancoefficient` DROP COLUMN `cuotaBalon12M`,
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
