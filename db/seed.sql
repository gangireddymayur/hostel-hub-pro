-- Default super admin login for an empty database.
-- Run this after `db/schema.sql`.
-- Email: mayurgangereddy12345@gmail.com
-- Password: mayur@123

INSERT INTO super_admins (
  id,
  email,
  password_hash,
  name
) VALUES (
  'super_admin_87a9d497-8b89-47a9-8923-34c9da59d427',
  'mayurgangereddy12345@gmail.com',
  'pbkdf2$sha256$120000$f67af86cebc3ad89b3513b2cc0db1823$5b9efbe7a160e59bc43531c45437fbfaeff8c27846f0c81db07bcf1361888ead',
  'Super Admin'
) ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  name = VALUES(name);
