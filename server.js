require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/alien_signal_defense';
const SESSION_SECRET = process.env.SESSION_SECRET || 'alien-signal-defense-dev-secret';

const pool = new Pool({
  connectionString: DATABASE_URL
});

async function ensureAuthColumns() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      admin_id SERIAL PRIMARY KEY,
      username VARCHAR(30) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'owner')),
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login_at TIMESTAMP
    )
  `);
  const tableChecks = [
    {
      table: 'players',
      columns: [
        { name: 'password_hash', type: 'TEXT' },
        { name: 'last_login_at', type: 'TIMESTAMP' }
      ]
    },
    {
      table: 'admin_users',
      columns: [
        { name: 'password_hash', type: 'TEXT' },
        { name: 'last_login_at', type: 'TIMESTAMP' }
      ]
    }
  ];

  for (const { table, columns } of tableChecks) {
    const existing = await pool.query(
      'SELECT column_name FROM information_schema.columns WHERE table_name = $1',
      [table]
    );
    const existingColumns = new Set(existing.rows.map(row => row.column_name));

    for (const column of columns) {
      if (existingColumns.has(column.name)) continue;
      await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`);
    }
  }

  await pool.query(`
    ALTER TABLE game_sessions
    ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) NOT NULL DEFAULT 'medium'
      CHECK (difficulty IN ('easy', 'medium', 'hard'))
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_activity_logs (
      log_id SERIAL PRIMARY KEY,
      admin_id INTEGER REFERENCES admin_users(admin_id) ON DELETE SET NULL,
      action VARCHAR(40) NOT NULL,
      resource VARCHAR(80) NOT NULL,
      record_id VARCHAR(80),
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

ensureAuthColumns().catch((error) => {
  console.error('Database migration check failed:', error.message);
});

const tableConfigs = {
  players: {
    label: 'Players',
    primaryKey: 'player_id',
    columns: ['player_id', 'username', 'email', 'created_at', 'total_score', 'highest_wave', 'status'],
    writable: ['username', 'email', 'total_score', 'highest_wave', 'status'],
    required: ['username', 'email'],
    types: {
      username: 'text',
      email: 'email',
      total_score: 'number',
      highest_wave: 'number',
      status: 'select'
    },
    options: { status: ['active', 'inactive', 'banned'] }
  },
  game_sessions: {
    label: 'Game Sessions',
    primaryKey: 'session_id',
    columns: ['session_id', 'player_id', 'started_at', 'ended_at', 'final_score', 'highest_wave', 'result', 'research_points', 'difficulty'],
    writable: ['player_id', 'started_at', 'ended_at', 'final_score', 'highest_wave', 'result', 'research_points', 'difficulty'],
    required: ['player_id', 'result'],
    types: {
      player_id: 'number',
      started_at: 'datetime-local',
      ended_at: 'datetime-local',
      final_score: 'number',
      highest_wave: 'number',
      result: 'select',
      research_points: 'number',
      difficulty: 'select'
    },
    options: { result: ['won', 'lost', 'abandoned'], difficulty: ['easy', 'medium', 'hard'] }
  },
  wave_results: {
    label: 'Wave Results',
    primaryKey: 'wave_result_id',
    columns: ['wave_result_id', 'session_id', 'wave_number', 'enemies_defeated', 'research_points_earned', 'survived'],
    writable: ['session_id', 'wave_number', 'enemies_defeated', 'research_points_earned', 'survived'],
    required: ['session_id', 'wave_number'],
    types: {
      session_id: 'number',
      wave_number: 'number',
      enemies_defeated: 'number',
      research_points_earned: 'number',
      survived: 'checkbox'
    }
  },
  upgrades: {
    label: 'Upgrades',
    primaryKey: 'upgrade_id',
    columns: ['upgrade_id', 'upgrade_name', 'description', 'base_cost', 'is_active'],
    writable: ['upgrade_name', 'description', 'base_cost', 'is_active'],
    required: ['upgrade_name', 'description', 'base_cost'],
    types: {
      upgrade_name: 'text',
      description: 'textarea',
      base_cost: 'number',
      is_active: 'checkbox'
    }
  },
  purchased_upgrades: {
    label: 'Purchased Upgrades',
    primaryKey: 'purchase_id',
    columns: ['purchase_id', 'session_id', 'upgrade_id', 'purchased_at', 'level_acquired'],
    writable: ['session_id', 'upgrade_id', 'purchased_at', 'level_acquired'],
    required: ['session_id', 'upgrade_id'],
    types: {
      session_id: 'number',
      upgrade_id: 'number',
      purchased_at: 'datetime-local',
      level_acquired: 'number'
    }
  },
  admin_users: {
    label: 'Admin Users',
    primaryKey: 'admin_id',
    columns: ['admin_id', 'username', 'email', 'role', 'status', 'created_at', 'last_login_at'],
    writable: ['username', 'email', 'role', 'status'],
    required: ['username', 'email', 'role', 'status'],
    types: {
      username: 'text',
      email: 'email',
      role: 'select',
      status: 'select'
    },
    options: {
      role: ['admin', 'owner'],
      status: ['active', 'disabled']
    }
  },
  admin_activity_logs: {
    label: 'Admin Activity Logs',
    primaryKey: 'log_id',
    columns: ['log_id', 'admin_id', 'action', 'resource', 'record_id', 'details', 'created_at'],
    writable: [],
    required: [],
    types: {}
  }
};

app.use(express.json());
app.use(session({
  store: new pgSession({
    pool,
    createTableIfMissing: true
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 8
  }
}));
app.use(express.static(__dirname));

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function requireAdmin(req, res, next) {
  if (!req.session.admin || req.session.admin.status !== 'active' || !['admin', 'owner'].includes(req.session.admin.role)) {
    return res.status(401).json({ error: 'Admin login required.' });
  }
  next();
}

function requirePlayer(req, res, next) {
  if (!req.session.player || req.session.player.status !== 'active') {
    return res.status(401).json({ error: 'Player login required.' });
  }
  next();
}

async function recordAdminActivity(admin, action, resource, recordId, details = {}) {
  await pool.query(
    `INSERT INTO admin_activity_logs (admin_id, action, resource, record_id, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [admin.admin_id, action, resource, recordId === undefined ? null : String(recordId), details]
  );
}

function getTableConfig(table) {
  const config = tableConfigs[table];
  if (!config) {
    const error = new Error('Unknown table.');
    error.status = 404;
    throw error;
  }
  return config;
}

function normalizeValue(value, type) {
  if (type === 'checkbox') return Boolean(value);
  if (value === '') return null;
  if (type === 'number' && value !== null && value !== undefined) return Number(value);
  return value;
}

function pickWritableBody(config, body, partial = false) {
  const entries = [];
  for (const column of config.writable) {
    if (!Object.prototype.hasOwnProperty.call(body, column)) continue;
    entries.push([column, normalizeValue(body[column], config.types[column])]);
  }

  if (!partial) {
    for (const field of config.required || []) {
      const found = entries.find(([column]) => column === field);
      if (!found || found[1] === null || found[1] === undefined || found[1] === '') {
        const error = new Error(`${field} is required.`);
        error.status = 400;
        throw error;
      }
    }
  }

  return entries;
}

function quotedColumns(columns) {
  return columns.map(column => `"${column}"`).join(', ');
}

app.get('/admin', (req, res) => {
  res.redirect('/admin.html');
});

app.get('/api/health', asyncRoute(async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: true });
  } catch (error) {
    res.status(503).json({ ok: false, database: false, error: error.message });
  }
}));

app.get('/api/auth/me', (req, res) => {
  res.json({ admin: req.session.admin || null });
});

app.post('/api/auth/signup', asyncRoute(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Username, email, and an 8+ character password are required.' });
  }

  const adminCount = await pool.query('SELECT COUNT(*)::int AS count FROM admin_users');
  if (adminCount.rows[0].count > 0 && !req.session.admin) {
    return res.status(403).json({ error: 'An existing administrator must create additional admin accounts.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO admin_users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING admin_id, username, email, role, status`,
    [username, email, passwordHash]
  );
  req.session.admin = result.rows[0];
  await recordAdminActivity(req.session.admin, 'admin_signup', 'admin_users', result.rows[0].admin_id);
  res.status(201).json({ admin: result.rows[0] });
}));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const result = await pool.query(
    `SELECT admin_id, username, email, password_hash, role, status
     FROM admin_users
     WHERE email = $1`,
    [email]
  );
  const admin = result.rows[0];
  const valid = admin && admin.status === 'active' && await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  await pool.query('UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE admin_id = $1', [admin.admin_id]);
  req.session.admin = {
    admin_id: admin.admin_id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    status: admin.status
  };
  res.json({ admin: req.session.admin });
}));

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

/* === PLAYER ACCOUNTS (separate from the admin console above) === */

app.get('/api/player/me', (req, res) => {
  res.json({ player: req.session.player || null });
});

app.post('/api/player/signup', asyncRoute(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Username, email, and an 8+ character password are required.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO players (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING player_id, username, email, total_score, highest_wave, status`,
    [username, email, passwordHash]
  );
  req.session.player = result.rows[0];
  res.status(201).json({ player: result.rows[0] });
}));

app.post('/api/player/login', asyncRoute(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const result = await pool.query(
    `SELECT player_id, username, email, password_hash, total_score, highest_wave, status
     FROM players
     WHERE email = $1`,
    [email]
  );
  const player = result.rows[0];
  const valid = player && player.status === 'active' && player.password_hash &&
    await bcrypt.compare(password, player.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  await pool.query('UPDATE players SET last_login_at = CURRENT_TIMESTAMP WHERE player_id = $1', [player.player_id]);
  req.session.player = {
    player_id: player.player_id,
    username: player.username,
    email: player.email,
    total_score: player.total_score,
    highest_wave: player.highest_wave,
    status: player.status
  };
  res.json({ player: req.session.player });
}));

app.post('/api/player/logout', (req, res) => {
  delete req.session.player;
  req.session.save(() => res.json({ ok: true }));
});

app.post('/api/player/games/start', requirePlayer, asyncRoute(async (req, res) => {
  const { difficulty } = req.body;
  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({ error: 'A valid difficulty is required.' });
  }
  const result = await pool.query(
    `INSERT INTO game_sessions (player_id, difficulty, result) VALUES ($1, $2, 'abandoned') RETURNING session_id, started_at, difficulty`,
    [req.session.player.player_id, difficulty]
  );
  res.status(201).json({ game: result.rows[0] });
}));

app.post('/api/player/games/:id/complete', requirePlayer, asyncRoute(async (req, res) => {
  const sessionId = Number(req.params.id);
  const { final_score, highest_wave, result, research_points, waves, enemies_defeated } = req.body;
  if (!Number.isInteger(sessionId) || !Number.isInteger(final_score) || !Number.isInteger(highest_wave) || !result) {
    return res.status(400).json({ error: 'A valid game result is required.' });
  }
  if (!['won', 'lost', 'abandoned'].includes(result) || final_score < 0 || final_score > 100000000 ||
      highest_wave < 1 || highest_wave > 1000 || !Number.isInteger(enemies_defeated) || enemies_defeated < 0 || enemies_defeated > 100000) {
    return res.status(400).json({ error: 'Game result values are invalid.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const owned = await client.query(
      `SELECT session_id, difficulty, ended_at FROM game_sessions
       WHERE session_id = $1 AND player_id = $2 FOR UPDATE`,
      [sessionId, req.session.player.player_id]
    );
    if (!owned.rowCount) {
      const error = new Error('Game session not found.');
      error.status = 404;
      throw error;
    }
    if (owned.rows[0].ended_at) {
      const error = new Error('This game session has already been completed.');
      error.status = 409;
      throw error;
    }

    await client.query(
      `UPDATE game_sessions
       SET ended_at = CURRENT_TIMESTAMP, final_score = $2, highest_wave = $3,
           result = $4, research_points = $5
       WHERE session_id = $1`,
      [sessionId, final_score, highest_wave, result, Math.max(0, Number(research_points) || 0)]
    );

    if (Array.isArray(waves)) {
      for (const wave of waves.slice(0, 200)) {
        const waveNumber = Number(wave.wave_number);
        const defeated = Number(wave.enemies_defeated);
        if (!Number.isInteger(waveNumber) || waveNumber < 1 || waveNumber > highest_wave ||
            !Number.isInteger(defeated) || defeated < 0 || defeated > 1000) continue;
        await client.query(
          `INSERT INTO wave_results (session_id, wave_number, enemies_defeated, research_points_earned, survived)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            sessionId,
            waveNumber,
            defeated,
            Number(wave.research_points_earned) || 0,
            Boolean(wave.survived)
          ]
        );
      }
    }

    const playerUpdate = await client.query(
      `UPDATE players
       SET total_score = total_score + $2,
           highest_wave = GREATEST(highest_wave, $3)
       WHERE player_id = $1
       RETURNING player_id, username, email, total_score, highest_wave, status`,
      [req.session.player.player_id, final_score, highest_wave]
    );

    await client.query('COMMIT');
    req.session.player = playerUpdate.rows[0];
    const highestScore = await client.query(
      `SELECT COALESCE(MAX(final_score), 0)::int AS highest_score
       FROM game_sessions WHERE player_id = $1 AND ended_at IS NOT NULL AND result IN ('won', 'lost')`,
      [req.session.player.player_id]
    );
    res.status(201).json({
      session_id: sessionId,
      player: req.session.player,
      highest_score: highestScore.rows[0].highest_score
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

app.post('/api/player/games/:id/abandon', requirePlayer, asyncRoute(async (req, res) => {
  const sessionId = Number(req.params.id);
  if (!Number.isInteger(sessionId)) {
    return res.status(400).json({ error: 'A valid game session is required.' });
  }
  const result = await pool.query(
    `UPDATE game_sessions
     SET ended_at = CURRENT_TIMESTAMP, result = 'abandoned'
     WHERE session_id = $1 AND player_id = $2 AND ended_at IS NULL
     RETURNING session_id`,
    [sessionId, req.session.player.player_id]
  );
  if (!result.rowCount) return res.status(404).json({ error: 'Open game session not found.' });
  res.json({ ok: true });
}));

app.get('/api/player/scores', requirePlayer, asyncRoute(async (req, res) => {
  const result = await pool.query(
    `SELECT session_id, final_score, difficulty, highest_wave, result, research_points, ended_at
     FROM game_sessions WHERE player_id = $1 AND ended_at IS NOT NULL AND result IN ('won', 'lost')
     ORDER BY ended_at DESC LIMIT 50`,
    [req.session.player.player_id]
  );
  res.json({ scores: result.rows });
}));

app.get('/api/player/progress', requirePlayer, asyncRoute(async (req, res) => {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS games_played,
            COALESCE(MAX(final_score), 0)::int AS highest_score,
            COALESCE(MAX(highest_wave), 0)::int AS highest_wave,
            COALESCE(SUM(w.final_enemies), 0)::int AS enemies_defeated,
            COALESCE(ROUND(AVG(final_score)), 0)::int AS average_score,
            MAX(ended_at) AS last_played
     FROM game_sessions s
     LEFT JOIN (SELECT session_id, SUM(enemies_defeated)::int AS final_enemies FROM wave_results GROUP BY session_id) w
       ON w.session_id = s.session_id
     WHERE s.player_id = $1 AND s.ended_at IS NOT NULL`,
    [req.session.player.player_id]
  );
  res.json({ progress: result.rows[0] });
}));

app.get('/api/player/leaderboard', asyncRoute(async (req, res) => {
  const result = await pool.query(
    `SELECT p.username, s.final_score, s.difficulty, s.highest_wave, s.ended_at
     FROM game_sessions s JOIN players p ON p.player_id = s.player_id
     WHERE p.status = 'active' AND s.ended_at IS NOT NULL
     ORDER BY s.final_score DESC, s.ended_at ASC LIMIT 10`
  );
  res.json({ leaderboard: result.rows });
}));

app.get('/api/tables', requireAdmin, (req, res) => {
  res.json({ tables: tableConfigs });
});

app.get('/api/admin/overview', requireAdmin, asyncRoute(async (req, res) => {
  const result = await pool.query(`
    SELECT (SELECT COUNT(*) FROM players)::int AS players,
           (SELECT COUNT(*) FROM players WHERE status = 'active')::int AS active_players,
           (SELECT COUNT(*) FROM game_sessions WHERE ended_at IS NOT NULL)::int AS completed_games,
           (SELECT COALESCE(MAX(final_score), 0) FROM game_sessions)::int AS highest_score,
           (SELECT COUNT(*) FROM admin_activity_logs)::int AS admin_actions
  `);
  res.json({ overview: result.rows[0] });
}));

app.get('/api/tables/:table', requireAdmin, asyncRoute(async (req, res) => {
  const config = getTableConfig(req.params.table);
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
  const search = String(req.query.search || '').trim();
  const values = [];
  const filters = [];
  if (search) {
    values.push(`%${search}%`);
    filters.push(`(${config.columns.map(column => `CAST("${column}" AS TEXT) ILIKE $${values.length}`).join(' OR ')})`);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const count = await pool.query(`SELECT COUNT(*)::int AS count FROM "${req.params.table}" ${where}`, values);
  values.push((page - 1) * limit, limit);
  const result = await pool.query(
    `SELECT ${quotedColumns(config.columns)} FROM "${req.params.table}" ${where}
     ORDER BY "${config.primaryKey}" DESC OFFSET $${values.length - 1} LIMIT $${values.length}`,
    values
  );
  res.json({ rows: result.rows, config, page, limit, total: count.rows[0].count });
}));

app.post('/api/tables/:table', requireAdmin, asyncRoute(async (req, res) => {
  const config = getTableConfig(req.params.table);
  if (!config.writable.length) {
    return res.status(400).json({ error: 'This table is read-only.' });
  }
  const entries = pickWritableBody(config, req.body);
  const columns = entries.map(([column]) => `"${column}"`).join(', ');
  const placeholders = entries.map((_, index) => `$${index + 1}`).join(', ');
  const values = entries.map(([, value]) => value);
  const result = await pool.query(
    `INSERT INTO "${req.params.table}" (${columns}) VALUES (${placeholders}) RETURNING ${quotedColumns(config.columns)}`,
    values
  );
  await recordAdminActivity(req.session.admin, 'create', req.params.table, result.rows[0][config.primaryKey]);
  res.status(201).json({ row: result.rows[0] });
}));

app.put('/api/tables/:table/:id', requireAdmin, asyncRoute(async (req, res) => {
  const config = getTableConfig(req.params.table);
  if (req.params.table === 'admin_users' && Number(req.params.id) === req.session.admin.admin_id &&
      (Object.prototype.hasOwnProperty.call(req.body, 'role') || Object.prototype.hasOwnProperty.call(req.body, 'status'))) {
    return res.status(400).json({ error: 'You cannot change your own admin role or status.' });
  }
  const entries = pickWritableBody(config, req.body, true);
  if (!entries.length) return res.status(400).json({ error: 'No editable fields supplied.' });

  const setClause = entries.map(([column], index) => `"${column}" = $${index + 1}`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(req.params.id);
  const result = await pool.query(
    `UPDATE "${req.params.table}" SET ${setClause} WHERE "${config.primaryKey}" = $${values.length} RETURNING ${quotedColumns(config.columns)}`,
    values
  );
  if (!result.rowCount) return res.status(404).json({ error: 'Record not found.' });
  await recordAdminActivity(req.session.admin, 'update', req.params.table, req.params.id);
  res.json({ row: result.rows[0] });
}));

app.delete('/api/tables/:table/:id', requireAdmin, asyncRoute(async (req, res) => {
  const config = getTableConfig(req.params.table);
  if (req.params.table === 'admin_users' && Number(req.params.id) === req.session.admin.admin_id) {
    return res.status(400).json({ error: 'You cannot delete your own active admin account.' });
  }
  const result = await pool.query(`DELETE FROM "${req.params.table}" WHERE "${config.primaryKey}" = $1`, [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'Record not found.' });
  await recordAdminActivity(req.session.admin, 'delete', req.params.table, req.params.id);
  res.json({ ok: true });
}));

app.get('/api/admin/activity', requireAdmin, asyncRoute(async (req, res) => {
  const result = await pool.query(
    `SELECT l.log_id, l.action, l.resource, l.record_id, l.details, l.created_at, a.username
     FROM admin_activity_logs l LEFT JOIN admin_users a ON a.admin_id = l.admin_id
     ORDER BY l.created_at DESC LIMIT 100`
  );
  res.json({ logs: result.rows });
}));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((error, req, res, next) => {
  console.error(error);
  const status = error.status || (error.code === '23505' ? 409 : 500);
  const message = error.code === '23505' ? 'A record with that unique value already exists.' : error.message;
  res.status(status).json({ error: message || 'Server error.' });
});

app.listen(PORT, () => {
  console.log(`Alien Signal Defense running at http://localhost:${PORT}`);
});
