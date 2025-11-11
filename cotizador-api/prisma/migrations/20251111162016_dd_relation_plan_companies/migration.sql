/*
  Warnings:

  - You are about to drop the column `companyId` on the `plans` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `plans` DROP FOREIGN KEY `plans_companyId_fkey`;

-- DropIndex
DROP INDEX `plans_companyId_fkey` ON `plans`;

-- AlterTable
ALTER TABLE `plans` DROP COLUMN `companyId`;

-- CreateTable
CREATE TABLE `_PlanCompanies` (
    `A` VARCHAR(36) NOT NULL,
    `B` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `_PlanCompanies_AB_unique`(`A`, `B`),
    INDEX `_PlanCompanies_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_PlanCompanies` ADD CONSTRAINT `_PlanCompanies_A_fkey` FOREIGN KEY (`A`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlanCompanies` ADD CONSTRAINT `_PlanCompanies_B_fkey` FOREIGN KEY (`B`) REFERENCES `plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
