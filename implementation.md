# Alien Signal Defense — Implementation Guide

## Project Overview

**Alien Signal Defense** is a browser-based typing arcade game. Alien ships descend from the top of the screen, each carrying a signal code word. The player types those words to destroy ships before they reach Earth. Difficulty escalates across waves; special power-up words trigger tactical abilities. A between-wave upgrade shop lets players spend earned Research Points to improve their defenses.

The game runs entirely in three files — no framework, no build step, no server.

---

## Project Structure

```
alien-signal-defense/
├── index.html    # App shell, canvas container, overlay screens
├── style.css     # All visual styles: HUD, overlays, animations, canvas chrome
└── game.js       # Complete game engine: loop, entities, input, waves, upgrades
```

Open `index.html` directly in any modern browser to play.

---

## File Responsibilities

### `index.html`
- Imports `style.css` then `game.js`.
- Contains a single `<canvas id="gameCanvas">` element that fills the viewport — all gameplay renders here.
- Contains overlay `<div>` containers (outside the canvas) for:
  - **Title screen** — start prompt and high score display.
  - **Wave announcement** — full-screen flash "WAVE 3 — INCOMING" between waves.
  - **Upgrade shop** — grid of purchasable upgrades shown between waves.
  - **Game over screen** — final score, wave reached, restart button.
  - **Power-up toast** — small banner that slides in when a power-up activates.
- Contains one `<input id="typingInput">` element (visually hidden, always focused during gameplay) that captures all keystrokes.
- No visible HTML text content during active gameplay — the HUD is drawn entirely on canvas.

### `style.css`

#### Design Tokens (CSS custom properties on `:root`)
```css
--void:        #050A14;   /* deep space background */
--grid:        #0D1F3C;   /* radar grid line color */
--neon-blue:   #00D4FF;   /* primary accent, typed-correct highlight */
--neon-purple: #9B30FF;   /* secondary accent, power-up words */
--neon-green:  #00FF88;   /* health, shield effects */
--warning-red: #FF3355;   /* damage flash, HP loss */
--text-dim:    #4A6FA5;   /* secondary HUD labels */
--text-bright: #E8F4FF;   /* primary HUD values */

--font-display: 'Orbitron', monospace;       /* wave numbers, score, game title */
--font-mono:    'Share Tech Mono', monospace; /* ship words, typed input, HUD data */

--anim-fast:   120ms;
--anim-mid:    350ms;
--anim-slow:   700ms;
```

Both fonts are loaded from Google Fonts in `index.html`.

#### Canvas & Layout
- `body` and `html` are `margin: 0; overflow: hidden; background: var(--void)`.
- `#gameCanvas` is `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh`.
- The canvas logical resolution is fixed at **1280 × 720** and scaled to fill the viewport using CSS `object-fit: contain` behavior (implemented in JS on resize).

#### Overlay Panels
- All overlay `<div>` containers are `position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center`.
- Default `opacity: 0; pointer-events: none`; active state is `opacity: 1; pointer-events: auto` with a CSS transition.
- The upgrade shop grid uses CSS Grid (`grid-template-columns: repeat(2, 1fr)`) for the upgrade cards.
- Upgrade cards have a `border: 1px solid var(--neon-blue)` with a `:hover` glow effect using `box-shadow`.

#### Animations
- **Ship entry**: CSS `@keyframes shipEntry` — fade in + translate from `y: -40px` to `y: 0` over `350ms`.
- **Explosion**: JS-driven particle burst on canvas (no CSS animation needed).
- **Damage flash**: `@keyframes damageFlash` — pulses `background` of `body` to `rgba(255,51,85,0.15)` and back over `250ms`.
- **Power-up toast**: slides in from right with `transform: translateX(110%)` → `translateX(0)`, auto-dismisses after 2s.
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` sets all transition/animation durations to `0ms`.

---

### `game.js`

Organized into clearly separated sections with `/* === SECTION === */` banner comments. No classes with private fields — plain functions and objects for maximum clarity and expandability.

---

#### 1. Constants & Configuration

```js
const CONFIG = {
  canvas: { width: 1280, height: 720 },
  player: { maxHp: 5, startHp: 5 },
  spawn: {
    laneCount: 6,           // vertical lanes ships travel in
    minInterval: 3000,      // ms between spawns at wave 1
    intervalDecay: 150,     // ms reduction per wave
    minIntervalCap: 600     // never faster than this
  },
  wave: {
    enemiesPerWave: 8,      // base enemies; scales with wave
    enemiesScaling: 3,      // added per wave
    betweenWaveDelay: 3000  // ms of upgrade shop time
  },
  research: {
    scorePerKill: { scout: 10, assault: 25, carrier: 50, mothership: 150 },
    scorePerWave: 100
  }
};
```

All tunable values live here. Difficulty is adjusted exclusively by changing `CONFIG` values — no magic numbers in game logic.

---

#### 2. Word Banks

```js
const WORDS = {
  short:    [ /* 60+ words, 3–5 letters */ ],
  medium:   [ /* 60+ words, 6–9 letters */ ],
  long:     [ /* 40+ words, 10–14 letters */ ],
  boss:     [
    ["OVERRIDE", "TERMINATE", "CORE"],
    ["INFILTRATE", "DECRYPT", "NEXUS"],
    ["BROADCAST", "DISRUPT", "SIGNAL"]
  ],
  powerups: ["JAMMER", "EMP", "SHIELD", "SCAN"]
};
```

Words are always rendered and matched in uppercase. The player's input is `.toUpperCase()`-coerced before comparison. Boss sequences are arrays of words; the ship displays one word at a time and advances to the next on each correct entry.

Power-up words spawn as a special entity type at random intervals and are drawn with a `var(--neon-purple)` glow to distinguish them visually.

---

#### 3. Entity Definitions

Each active ship is a plain object:

```js
{
  id: uniqueId(),
  type: "scout" | "assault" | "carrier" | "mothership" | "powerup",
  lane: 0..5,              // horizontal lane index
  x: Number,              // derived from lane
  y: Number,              // starts negative, moves downward
  speed: Number,          // px per frame, sourced from type config
  word: String,           // current word to type (full string)
  progress: Number,       // characters correctly typed so far
  hp: Number,             // mothership only: starts at 3
  sequence: Array|null,   // mothership only: remaining words in sequence
  powerupType: String|null // powerup entities only
}
```

##### Type Config

| Type | Speed (px/frame) | Word Source | HP |
|---|---|---|---|
| Scout Drone | 1.8 | `WORDS.short` | 1 |
| Assault Ship | 1.1 | `WORDS.medium` | 1 |
| Signal Carrier | 0.6 | `WORDS.long` | 1 |
| Mothership | 0.4 | `WORDS.boss` sequence | 3 |
| Power-up | 0.7 | `WORDS.powerups` | 1 |

Speed values are for Wave 1. Each wave multiplies speed by `1 + (wave - 1) * 0.08`.

---

#### 4. Game State Object

```js
const State = {
  phase: "title",          // "title" | "playing" | "wave_end" | "upgrade" | "gameover"
  wave: 0,
  score: 0,
  researchPoints: 0,
  hp: CONFIG.player.startHp,
  activeShips: [],         // array of entity objects
  particles: [],           // explosion/trail particle objects
  targetShip: null,        // entity currently being typed at (auto-targeted)
  powerupActive: null,     // { type, expiresAt } or null
  upgrades: { ... },       // current upgrade levels (see Upgrade System)
  enemiesThisWave: 0,      // total to spawn this wave
  enemiesSpawned: 0,
  enemiesDefeated: 0,
  spawnTimer: 0,
  frameTime: 0,            // timestamp of last frame
  highScore: 0             // loaded from localStorage on init
};
```

`State` is the single source of truth. No other mutable globals.

---

#### 5. Game Loop

```js
function gameLoop(timestamp) {
  const dt = timestamp - State.frameTime;
  State.frameTime = timestamp;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}
```

`update(dt)` runs every module's update function in order:
1. `spawnSystem.update(dt)`
2. `shipMovement.update(dt)`
3. `collisionCheck()`
4. `particleSystem.update(dt)`
5. `powerupSystem.update(dt)`
6. `waveSystem.check()`

`render()` clears the canvas and redraws every frame:
1. `drawBackground()` — star field + radar grid
2. `drawEarth()` — stylized Earth at the bottom edge
3. `drawShips()` — all active entities
4. `drawParticles()`
5. `drawHUD()`

---

#### 6. Input System

The hidden `<input>` element is focused immediately on game start and re-focused any time the canvas is clicked.

```js
typingInput.addEventListener('input', handleInput);

function handleInput(e) {
  if (State.phase !== 'playing') return;

  const typed = typingInput.value.toUpperCase();
  typingInput.value = '';  // clear after each character

  // 1. Check if typed string matches the start of any power-up word first
  // 2. Otherwise, find or continue targeting the best-match ship
  resolveInput(typed);
}
```

**Auto-targeting rules** (in priority order):
1. If a ship's word starts with the typed characters and no other ship was already targeted, lock onto it.
2. If a ship is already targeted (`State.targetShip`) and typed characters continue matching, stay locked.
3. If the typed character breaks the current target's match, clear progress on that ship and search for a new match.
4. Power-up words always take priority over ship words if their first character matches.

**Partial progress rendering**: Each ship's word is drawn as two segments — matched prefix in `var(--neon-blue)` with an underline, unmatched suffix in `var(--text-dim)`.

---

#### 7. Spawn System

```js
const spawnSystem = {
  update(dt) {
    State.spawnTimer -= dt;
    if (State.spawnTimer <= 0 && State.enemiesSpawned < State.enemiesThisWave) {
      spawnShip();
      resetTimer();
    }
  },

  resetTimer() {
    const interval = Math.max(
      CONFIG.spawn.minIntervalCap,
      CONFIG.spawn.minInterval - (State.wave - 1) * CONFIG.spawn.intervalDecay
    );
    State.spawnTimer = interval + (Math.random() - 0.5) * 400; // ±200ms jitter
  }
};

function spawnShip() {
  const type = pickEnemyType();   // weighted random, boss only on wave % 5
  const lane = pickFreeLane();    // avoid stacking two ships in same lane
  const entity = buildEntity(type, lane);
  State.activeShips.push(entity);
  State.enemiesSpawned++;
}
```

**Enemy type weighting by wave**:

| Wave | Scout | Assault | Carrier | Mothership |
|---|---|---|---|---|
| 1–2 | 80% | 20% | 0% | 0% |
| 3–4 | 50% | 40% | 10% | 0% |
| 5–9 | 30% | 40% | 25% | 5% |
| 10+ | 15% | 35% | 35% | 15% |

Motherships only spawn one at a time. If a mothership is already active, the slot rerolls to Carrier.

Power-up words spawn as a separate overlay entity (not part of the wave count) at a random interval between 20–40 seconds, regardless of wave.

---

#### 8. Collision Detection

Ships travel strictly vertically in their lane (`x` is fixed). Collision is a simple threshold:

```js
function collisionCheck() {
  State.activeShips.forEach(ship => {
    if (ship.y >= CONFIG.canvas.height - EARTH_ZONE_HEIGHT) {
      damagePlayer(ship);
      removeShip(ship);
    }
  });
}

function damagePlayer(ship) {
  State.hp -= 1;
  triggerDamageFlash();
  if (State.hp <= 0) triggerGameOver();
}
```

`EARTH_ZONE_HEIGHT` is the pixel height reserved for the Earth graphic at the bottom (approximately 80px).

---

#### 9. Power-up System

```js
const POWERUP_EFFECTS = {
  JAMMER: () => {
    // Halve all ship speeds for 8 seconds
    State.activeShips.forEach(s => s.speed *= 0.5);
    State.powerupActive = { type: 'JAMMER', expiresAt: Date.now() + 8000 };
  },
  EMP: () => {
    // Destroy all Scout and Assault ships instantly (no score)
    State.activeShips = State.activeShips.filter(
      s => s.type === 'carrier' || s.type === 'mothership'
    );
    spawnExplosions('all');
  },
  SHIELD: () => {
    // Restore 1 HP, capped at maxHp
    State.hp = Math.min(State.hp + 1, CONFIG.player.maxHp);
    showToast('SHIELD RESTORED +1 HP');
  },
  SCAN: () => {
    // Reveal all ships' next words and pause spawn timer for 5 seconds
    State.spawnTimer += 5000;
    highlightAllWords();
    showToast('SCAN ACTIVE — TARGETS REVEALED');
  }
};
```

The power-up system update checks `State.powerupActive.expiresAt` each frame and reverses timed effects (e.g., restoring JAMMER'd speeds) when the timer expires.

---

#### 10. Wave System

```js
const waveSystem = {
  check() {
    const waveComplete =
      State.enemiesDefeated + State.activeShips.length === State.enemiesThisWave &&
      State.activeShips.length === 0;

    if (waveComplete) endWave();
  }
};

function endWave() {
  State.score += CONFIG.research.scorePerWave;
  State.researchPoints += CONFIG.research.scorePerWave;
  State.phase = 'upgrade';
  showUpgradeShop();
}

function startNextWave() {
  State.wave++;
  State.enemiesThisWave = CONFIG.wave.enemiesPerWave + (State.wave - 1) * CONFIG.wave.enemiesScaling;
  State.enemiesSpawned = 0;
  State.enemiesDefeated = 0;
  State.phase = 'playing';
  showWaveAnnouncement(`WAVE ${State.wave}`);
}
```

---

#### 11. Upgrade System

Between waves, the upgrade shop is shown as an HTML overlay. Player clicks upgrade cards to spend Research Points.

**Upgrade definitions**:

```js
const UPGRADES = {
  forgiveness: {
    label: "Typing Forgiveness",
    description: "Mistakes don't reset progress. (1 error allowed)",
    levels: [0, 1, 2],           // max 2 upgrades
    costs: [75, 150],
    effect: (level) => { State.upgrades.allowedErrors = level; }
  },
  attackBonus: {
    label: "Signal Amplifier",
    description: "Correct word destroys one nearby ship too.",
    levels: [0, 1],
    costs: [120],
    effect: (level) => { State.upgrades.splashKill = level > 0; }
  },
  extraHp: {
    label: "Hull Reinforcement",
    description: "+1 Max HP and restore 1 HP now.",
    levels: [0, 1, 2, 3],
    costs: [80, 130, 200],
    effect: (level) => {
      CONFIG.player.maxHp = 5 + level;
      State.hp = Math.min(State.hp + 1, CONFIG.player.maxHp);
    }
  },
  cooldown: {
    label: "Power Core",
    description: "Power-up words spawn 30% more often.",
    levels: [0, 1, 2],
    costs: [60, 110],
    effect: (level) => { State.upgrades.powerupRateBonus = level * 0.3; }
  }
};
```

`State.upgrades` tracks current level for each key. Cards show current level, cost, and a disabled state when maxed or when the player can't afford.

---

#### 12. Rendering

All gameplay visuals draw onto the `<canvas>`. The canvas context is `ctx = canvas.getContext('2d')`.

**Draw order per frame**:

```
1. drawBackground()
   ├── Fill rect with var(--void) hex
   ├── Draw subtle star field (pre-generated random dot positions)
   └── Draw radar grid: concentric arcs + crosshair lines in var(--grid)

2. drawEarth()
   └── Gradient-filled arc at bottom: blue→teal hemisphere with atmosphere glow

3. drawShips()
   └── For each entity in State.activeShips:
       ├── Draw ship body (unique polygon per type, filled with type color)
       ├── Draw energy trail (gradient rect behind ship, alpha fades with distance)
       ├── Draw word above ship
       │   ├── Matched prefix: neon-blue, bold
       │   └── Unmatched suffix: text-dim, normal
       └── Draw HP bar below ship name (mothership only)

4. drawParticles()
   └── For each particle in State.particles:
       ├── Fade alpha over lifetime
       └── Draw small colored circle

5. drawHUD()
   ├── Top-left: SCORE value, WAVE label
   ├── Top-right: HP hearts (filled/empty icons), RESEARCH POINTS
   └── Bottom-center: current active power-up indicator (if any)
```

**Ship visual shapes** (drawn with `ctx.beginPath()` / `ctx.lineTo()` polygons):

| Type | Shape | Color |
|---|---|---|
| Scout Drone | Narrow diamond | `#00D4FF` |
| Assault Ship | Chevron (arrow pointing down) | `#9B30FF` |
| Signal Carrier | Wide hexagon | `#FF8C00` |
| Mothership | Large irregular octagon | `#FF3355` |
| Power-up | Rotating square (rotated via ctx.rotate each frame) | `#00FF88` |

**Particle explosion**:
- On ship destruction: spawn 12–18 particles at the ship's position.
- Each particle has `{ x, y, vx, vy, alpha: 1, color, life, maxLife }`.
- `vx` and `vy` are random in `[-4, 4]` px/frame.
- `alpha` decreases by `1 / maxLife` per frame.
- Particles are removed when `alpha <= 0`.

---

#### 13. Save & High Score

```js
const Storage = {
  save() {
    localStorage.setItem('asd_highscore', State.highScore);
  },
  load() {
    State.highScore = parseInt(localStorage.getItem('asd_highscore') || '0');
    // Upgrades are NOT persisted across sessions — reset each run
  }
};
```

Only the high score persists between sessions. Upgrade purchases reset on Game Over / new run.

---

## Screen Flow

```
Title Screen
    |
    +-- [any key] --> Wave Announcement ("WAVE 1 — INCOMING")
                          |
                          +--> Playing
                                |
                         +------+------+
                    Wave clear        HP = 0
                         |                |
                    Upgrade Shop     Game Over Screen
                         |                |
                    [Continue]        [Restart]
                         |                |
                    Wave Announcement  Title Screen
                         |
                       Playing
```

---

## Difficulty Scaling Summary

| Wave | Spawn Interval | Speed Multiplier | Word Length Bias | Boss Chance |
|---|---|---|---|---|
| 1 | 3000ms | 1.0x | Short-heavy | 0% |
| 3 | 2700ms | 1.16x | Mixed | 0% |
| 5 | 2400ms | 1.32x | Medium-heavy | 5% |
| 8 | 1950ms | 1.56x | Long-heavy | 12% |
| 12 | 1350ms | 1.88x | Long + Boss | 18% |
| 15+ | 900ms (min cap) | 2.12x | Long + Boss | 22% |

---

## Code Quality Standards

- Every JS section opens with a `/* === SECTION NAME === */` comment.
- Functions are under 35 lines; longer routines are split into named helpers.
- `CONFIG` contains all magic numbers — nothing hardcoded in logic.
- `State` is the only mutable global; all functions accept it as an argument or close over it explicitly.
- The word banks (`WORDS`) are the only data that lives outside `CONFIG` or `State`.
- No `innerHTML` in the game loop — DOM manipulation is limited to overlay show/hide toggling via CSS class.

---

## Expandability Notes

**Adding a new enemy type**: Add an entry to the type config table, define its polygon draw routine, add its word source key, and include it in the wave weighting table. No other changes needed.

**Adding a new power-up**: Add its keyword to `WORDS.powerups` and add its handler to `POWERUP_EFFECTS`. The spawn system and input detection pick it up automatically.

**Adding a new upgrade**: Add an entry to `UPGRADES`, add the corresponding key to `State.upgrades`, and reference it in the relevant game logic function. The upgrade shop renders all entries in `UPGRADES` dynamically.

---

## Deliverables Checklist

- [ ] `index.html` — canvas, hidden input, all overlay containers, font imports
- [ ] `style.css` — all tokens, overlays, animations, responsive canvas scaling, reduced-motion
- [ ] `game.js` — full engine: loop, entities, input, waves, upgrades, particles, save
- [ ] 4 enemy types functional (Scout, Assault, Carrier, Mothership)
- [ ] 4 power-up words functional (JAMMER, EMP, SHIELD, SCAN)
- [ ] Upgrade shop with 4 upgrade paths
- [ ] Real-time typing highlight on ship words
- [ ] Auto-targeting with priority resolution
- [ ] Collision detection → HP loss → Game Over
- [ ] Wave announcement overlays
- [ ] Particle explosions on ship destruction
- [ ] High score persisted in localStorage
- [ ] Playable at 1280x720 with viewport scaling
