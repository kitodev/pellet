-- Pellet Centrum – creates the database. Tables are created and updated by:
--
--     pnpm db:migrate
--
-- (database/migrate.mjs runs database/migrations/* once each, in order.)
-- If you prefer phpMyAdmin: import this file, then the .sql files in
-- database/migrations in order – but the .mjs steps need `pnpm db:migrate`.
-- Works with MySQL 5.6+/8 and MariaDB 10.1+ (XAMPP).

CREATE DATABASE IF NOT EXISTS pellet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
