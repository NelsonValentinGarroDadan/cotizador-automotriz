/*
  Warnings:

  - You are about to drop the column `ownerId` on the `companies` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `companies` DROP FOREIGN KEY `companies_ownerId_fkey`;

-- DropIndex
DROP INDEX `companies_ownerId_fkey` ON `companies`;

-- AlterTable
ALTER TABLE `companies` DROP COLUMN `ownerId`;
