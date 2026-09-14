-- Migration: add player authentication columns
-- Run this ONLY if you already created your database from an older copy of
-- alien_signal_defense.sql that does not have password_hash / last_login_at
-- on the players table. A fresh run of alien_signal_defense.sql already
-- includes these columns, so you do not need this file in that case.

ALTER TABLE players ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

SELECT 'Player auth columns are ready' AS status;
