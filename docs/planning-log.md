# Dated Planning Log

This log records the four development stages used for Alien Signal Defense and links each stage to evidence that can be checked in the workspace or Git history. It is written as a corrective evidence log after tutor feedback, so it does not pretend that a separate task board existed during the original build.

| Stage | Focus | Verifiable dated evidence | Notes |
| --- | --- | --- | --- |
| 1 | Design and data planning | Report file created on 2026-09-21; use-case diagram exported on 2026-10-05; DFD and flowchart exported on 2026-10-05 | Defines actors, data flow, and database-led structure before final submission. |
| 2 | Core backend and authentication | Sanitised public Git history includes the initial project commit on 2026-09-14 and later update commits on 2026-09-22 | Covers Express, PostgreSQL connection, player/admin accounts, sessions, and password hashing. |
| 3 | Gameplay and saved stats | Sanitised public Git history includes update commits on 2026-09-22; final source includes `game.js`, `server.js`, and PostgreSQL tables for sessions and wave results | Covers typing gameplay, waves, scoring, saved game sessions, and progress data. |
| 4 | Admin tools, polish, and evaluation | Admin screenshots exported on 2026-10-05; repository cleanup and evidence commits created on 2026-10-06; admin activity details fix committed after feedback on 2026-10-06 | Covers CRUD dashboard, activity logs, repository cleanup, report evidence, and final testing. |

## Feedback Response

The original project was developed in long local sessions and the public repository did not show a commit for every feature. After feedback, the repository was cleaned so generated/local files were not tracked, and the current evidence work was committed in small steps so that the corrective work itself is visible in Git.
