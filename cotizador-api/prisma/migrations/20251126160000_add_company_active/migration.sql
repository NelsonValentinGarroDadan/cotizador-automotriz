-- Add active flag to companies for soft delete
ALTER TABLE `companies`
ADD COLUMN `active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `logo`;

-- Backfill existing companies as active
UPDATE `companies` SET `active` = 1 WHERE `active` IS NULL;
