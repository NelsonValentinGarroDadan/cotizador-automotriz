-- CreateTable
CREATE TABLE `_AllowedPlans` (
    `A` VARCHAR(36) NOT NULL,
    `B` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `_AllowedPlans_AB_unique`(`A`, `B`),
    INDEX `_AllowedPlans_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_AllowedPlans` ADD CONSTRAINT `_AllowedPlans_A_fkey` FOREIGN KEY (`A`) REFERENCES `plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AllowedPlans` ADD CONSTRAINT `_AllowedPlans_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
