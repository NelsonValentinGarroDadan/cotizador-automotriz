-- Add active flag to users for soft delete
ALTER TABLE `users`
ADD COLUMN `active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `role`;

-- Backfill existing users as active
UPDATE `users` SET `active` = 1 WHERE `active` IS NULL;
