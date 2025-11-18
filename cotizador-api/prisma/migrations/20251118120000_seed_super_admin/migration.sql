-- Seed initial SUPER_ADMIN user

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
  '00000000-0000-0000-0000-000000000001',
  'superadmin@gmail.com',
  '$2b$10$dAsYOmGV.cEBX40qH9MT5O1vX0R30FBF5KembOYgyAwD5eMww3Om2',
  'Super',
  'Admin',
  'SUPER_ADMIN',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `email` = VALUES(`email`);

