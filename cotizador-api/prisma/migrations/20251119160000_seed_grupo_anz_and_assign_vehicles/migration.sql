-- Seed company 'Grupo ANZ' and admin user, and assign all autos_versiones to this company

-- 1) Crear compañía Grupo ANZ (id fijo)
INSERT INTO `companies` (`id`, `name`, `logo`, `createdAt`, `updatedAt`)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  'Grupo ANZ',
  '/uploads/companies/1763993005628-720498653.webp',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`);

-- 2) Crear usuario ADMIN para Grupo ANZ (email y password fijos) 
INSERT INTO `users` (
  `id`,
  `email`,
  `password`,
  `firstName`,
  `lastName`,
  `role`,
  `createdAt`,
  `updatedAt`
)
VALUES (
  '22222222-2222-4222-8222-222222222222',
  'admin@grupoanz.com',
  '$2b$10$dAsYOmGV.cEBX40qH9MT5O1vX0R30FBF5KembOYgyAwD5eMww3Om2',
  'Admin',
  'GrupoANZ',
  'ADMIN',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `email` = VALUES(`email`);

-- 3) Relacionar admin con la compañía en user_companies
INSERT INTO `user_companies` (`id`, `userId`, `companyId`, `createdAt`)
VALUES (
  UUID(),
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  NOW()
)
ON DUPLICATE KEY UPDATE
  `userId` = VALUES(`userId`),
  `companyId` = VALUES(`companyId`);

-- 4) Asignar todas las versiones de autos (autos_versiones) a la compañía Grupo ANZ
--    Creando registros en la tabla intermedia `_CompanyVehicles` (relación CompanyVehicles)
--    A = idversion (autos_versiones), B = companyId (companies)

-- Asegurarse de que la tabla intermedia exista
CREATE TABLE IF NOT EXISTS `_CompanyVehicles` (
  `A` INT NOT NULL,
  `B` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`A`, `B`),
  KEY `idx_CompanyVehicles_B` (`B`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `_CompanyVehicles`
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `B` VARCHAR(36) NOT NULL COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO `_CompanyVehicles` (`A`, `B`)
SELECT
  v.`idversion` AS A,
  '11111111-1111-4111-8111-111111111111' AS B
FROM `autos_versiones` v;
