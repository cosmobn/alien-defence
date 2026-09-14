-- Add player game reporting fields and administrator audit storage.
-- Run against the existing alien_signal_defense database.

CREATE TABLE IF NOT EXISTS admin_users (
  admin_id SERIAL PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'owner')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

ALTER TABLE game_sessions
  ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) NOT NULL DEFAULT 'medium';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'game_sessions_difficulty_check'
  ) THEN
    ALTER TABLE game_sessions
      ADD CONSTRAINT game_sessions_difficulty_check
      CHECK (difficulty IN ('easy', 'medium', 'hard'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  log_id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_users(admin_id) ON DELETE SET NULL,
  action VARCHAR(40) NOT NULL,
  resource VARCHAR(80) NOT NULL,
  record_id VARCHAR(80),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
