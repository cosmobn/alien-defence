-- PostgreSQL script for Alien Signal Defense
-- Run this in pgAdmin after creating or selecting the database: alien_signal_defense

-- Uncomment the line below if you need to create the database from scratch in pgAdmin.
-- CREATE DATABASE alien_signal_defense;

-- Optional: ensure the script is executed in the correct database.
CREATE SCHEMA IF NOT EXISTS public;

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS purchased_upgrades;
DROP TABLE IF EXISTS wave_results;
DROP TABLE IF EXISTS game_sessions;
DROP TABLE IF EXISTS admin_activity_logs;
DROP TABLE IF EXISTS upgrades;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS admin_users;

-- 0. Admin users for the management console
CREATE TABLE admin_users (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'owner')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- 1. Players table
CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_score INTEGER DEFAULT 0,
    highest_wave INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    last_login_at TIMESTAMP
);

-- NOTE: password_hash is nullable so this seed data can load without real
-- passwords. The sample players below were not created through the signup
-- form and cannot log in until an app admin resets their password.

-- 2. Game sessions table
CREATE TABLE game_sessions (
    session_id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(player_id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    final_score INTEGER NOT NULL DEFAULT 0,
    highest_wave INTEGER NOT NULL DEFAULT 1,
    result VARCHAR(20) NOT NULL CHECK (result IN ('won', 'lost', 'abandoned')),
    research_points INTEGER DEFAULT 0,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

-- 3. Wave results table
CREATE TABLE wave_results (
    wave_result_id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES game_sessions(session_id) ON DELETE CASCADE,
    wave_number INTEGER NOT NULL CHECK (wave_number > 0),
    enemies_defeated INTEGER NOT NULL DEFAULT 0,
    research_points_earned INTEGER NOT NULL DEFAULT 0,
    survived BOOLEAN DEFAULT TRUE
);

-- 4. Upgrades catalog
CREATE TABLE upgrades (
    upgrade_id SERIAL PRIMARY KEY,
    upgrade_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    base_cost INTEGER NOT NULL CHECK (base_cost > 0),
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. Purchased upgrades per session
CREATE TABLE purchased_upgrades (
    purchase_id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES game_sessions(session_id) ON DELETE CASCADE,
    upgrade_id INTEGER NOT NULL REFERENCES upgrades(upgrade_id) ON DELETE RESTRICT,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    level_acquired INTEGER NOT NULL DEFAULT 1 CHECK (level_acquired > 0)
);

-- 6. Administrator activity log
CREATE TABLE admin_activity_logs (
    log_id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admin_users(admin_id) ON DELETE SET NULL,
    action VARCHAR(40) NOT NULL,
    resource VARCHAR(80) NOT NULL,
    record_id VARCHAR(80),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample player data
INSERT INTO players (username, email, total_score, highest_wave, status) VALUES
('NovaRider', 'nova.rider@stellarmail.com', 18450, 12, 'active'),
('SignalHunter', 'hunter@orbitnet.com', 13680, 9, 'active'),
('CipherFox', 'priya.singh@skyforge.dev', 22190, 15, 'active'),
('OrbitOwen', 'owen.brooks@cometmail.org', 9470, 6, 'active'),
('LunaByte', 'nina.alvarez@nebulaspace.net', 16740, 11, 'active');

-- Insert sample game sessions
INSERT INTO game_sessions (player_id, started_at, ended_at, final_score, highest_wave, result, research_points) VALUES
(1, '2026-06-01 18:30:00', '2026-06-01 18:42:10', 18450, 12, 'lost', 320),
(2, '2026-06-03 20:15:00', '2026-06-03 20:36:45', 13680, 9, 'lost', 210),
(3, '2026-06-05 17:00:00', '2026-06-05 17:28:30', 22190, 15, 'won', 480),
(1, '2026-06-08 19:05:00', '2026-06-08 19:18:20', 15240, 10, 'lost', 275),
(4, '2026-06-09 21:40:00', '2026-06-09 21:59:00', 9470, 6, 'lost', 140),
(5, '2026-06-10 16:20:00', '2026-06-10 16:47:00', 16740, 11, 'lost', 300),
(3, '2026-06-12 18:50:00', '2026-06-12 19:07:15', 20450, 13, 'lost', 360);

-- Insert sample wave results
INSERT INTO wave_results (session_id, wave_number, enemies_defeated, research_points_earned, survived) VALUES
(1, 1, 8, 40, TRUE),
(1, 2, 10, 55, TRUE),
(1, 3, 7, 35, FALSE),
(2, 1, 6, 30, TRUE),
(2, 2, 9, 45, TRUE),
(2, 3, 5, 25, FALSE),
(3, 1, 8, 40, TRUE),
(3, 2, 10, 60, TRUE),
(3, 3, 12, 70, TRUE),
(3, 4, 11, 65, TRUE),
(3, 5, 9, 50, TRUE),
(3, 6, 10, 55, TRUE),
(4, 1, 7, 35, TRUE),
(4, 2, 8, 40, TRUE),
(4, 3, 6, 30, FALSE),
(5, 1, 5, 25, TRUE),
(5, 2, 4, 20, FALSE),
(6, 1, 8, 40, TRUE),
(6, 2, 9, 45, TRUE),
(6, 3, 7, 35, FALSE),
(7, 1, 7, 35, TRUE),
(7, 2, 10, 50, TRUE),
(7, 3, 8, 40, FALSE);

-- Insert upgrade catalog
INSERT INTO upgrades (upgrade_name, description, base_cost, is_active) VALUES
('Signal Amplifier', 'Increases damage against incoming alien waves.', 120, TRUE),
('Shield Patch', 'Adds extra hull protection during defense runs.', 90, TRUE),
('Rapid Typing', 'Improves typing speed and response time.', 110, TRUE),
('Research Boost', 'Earns extra research points after each wave.', 150, TRUE),
('Power Core', 'Improves power-up effectiveness during battles.', 130, TRUE);

-- Insert purchased upgrade records
INSERT INTO purchased_upgrades (session_id, upgrade_id, purchased_at, level_acquired) VALUES
(1, 1, '2026-06-01 18:35:00', 1),
(1, 3, '2026-06-01 18:38:00', 1),
(2, 2, '2026-06-03 20:20:00', 1),
(3, 1, '2026-06-05 17:05:00', 2),
(3, 4, '2026-06-05 17:12:00', 1),
(6, 5, '2026-06-10 16:25:00', 1),
(7, 3, '2026-06-12 18:55:00', 1);

-- Simple query to verify that the seed data loaded correctly
SELECT 'Database seed complete' AS status;
