-- Default super admin login for an empty database.
-- Run this after `db/schema.sql`.
-- Email: admin@hostelhub.local
-- Password: Admin@12345

INSERT INTO super_admins (
  id,
  email,
  password_hash,
  name
) VALUES (
  'super_admin_87a9d497-8b89-47a9-8923-34c9da59d427',
  'admin@hostelhub.local',
  'pbkdf2$sha256$120000$bfdcb41daa8ed0bb9fd485e4bcf35e18$39aec469fafb4555090279abda66550a53f650904a3bd8b970000932b578b2d6',
  'Super Admin'
) ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  name = VALUES(name);
