/*
  Warnings:

  - You are about to drop the column `coefficients` on the `plan_versions` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `plans` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `plan_versions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `plan_versions` DROP COLUMN `coefficients`,
    ADD COLUMN `createdById` VARCHAR(191) NOT NULL,
    ADD COLUMN `isLatest` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `plans` DROP COLUMN `active`,
    ADD COLUMN `logo` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `plan_coefficients` (
    `id` VARCHAR(36) NOT NULL,
    `planVersionId` VARCHAR(36) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `value` DECIMAL(10, 4) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `plan_coefficients_planVersionId_idx`(`planVersionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `plan_versions` ADD CONSTRAINT `plan_versions_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plan_coefficients` ADD CONSTRAINT `plan_coefficients_planVersionId_fkey` FOREIGN KEY (`planVersionId`) REFERENCES `plan_versions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
