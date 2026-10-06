# Alien Signal Defense

Alien Signal Defense is a browser typing defense game with a Node.js/Express backend, PostgreSQL persistence, player authentication, and an admin control panel.

## Run Locally

```powershell
npm install
npm start
```

The app runs at `http://localhost:3001` when `PORT=3001` is set in `.env`.

## Environment

Copy `.env.example` to `.env` and set your local PostgreSQL connection:

```env
PORT=3001
DATABASE_URL=postgres://postgres:your_password@localhost:5432/alien_signal_defense
SESSION_SECRET=change-this-secret-before-sharing
```

## Useful Commands

```powershell
npm run smoke
```

## Evidence

- `docs/planning-log.md` records the four project stages with dated evidence.
- `docs/development-evidence.md` summarises commit and screenshot evidence.
- `docs/evidence/` contains dated admin dashboard screenshots.
