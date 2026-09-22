/* === CONSTANTS & CONFIGURATION === */
const CONFIG = {
  canvas: { width: 1280, height: 720 },
  player: { maxHp: 5, startHp: 5 },
  spawn: {
    laneCount: 6,
    minInterval: 3000,
    intervalDecay: 150,
    minIntervalCap: 600,
    powerupMin: 20000,
    powerupMax: 40000
  },
  wave: {
    enemiesPerWave: 10,
    enemiesScaling: 3,
    announcementTime: 1400
  },
  research: {
    scorePerKill: { scout: 10, assault: 25, carrier: 50, mothership: 150 },
    scorePerWave: 100
  },
  earthZoneHeight: 82,
  typing: { allowedBaseErrors: 0 },
  particles: { minExplosion: 12, maxExplosion: 18 },
  effects: { jammerDuration: 8000, scanDelay: 5000 },
  audio: {
    masterVolume: 0.54,
    sfxVolume: 0.48,
    musicVolume: 0.16,
    musicStepMs: 520,
    musicNotes: [110, 146.83, 164.81, 196, 220, 246.94, 293.66]
  }
};

const COLORS = {
  void: '', grid: '', blue: '', purple: '', green: '', red: '', dim: '', bright: '',
  earthCore: '', earthMid: '', earthEdge: '', bossTrack: '', hudEmpty: ''
};

const TYPE_CONFIG = {
  scout: { speed: 1.8, wordBank: 'short', colorKey: 'blue', radius: 24 },
  assault: { speed: 1.1, wordBank: 'medium', colorKey: 'purple', radius: 32 },
  carrier: { speed: 0.6, wordBank: 'long', colorKey: 'orange', radius: 40 },
  mothership: { speed: 0.4, wordBank: 'boss', colorKey: 'red', radius: 56 },
  powerup: { speed: 0.7, wordBank: 'powerups', colorKey: 'green', radius: 24 }
};

const DIFFICULTY_WORD_BANKS = {
  easy: { scout: 'short', assault: 'short', carrier: 'medium' },
  medium: { scout: 'short', assault: 'medium', carrier: 'long' },
  hard: { scout: 'long', assault: 'long', carrier: 'hard' }
};

const STORAGE_KEY = 'asd_highscore';
const THEME_STORAGE_KEY = 'asd_theme';
const MUSIC_VOLUME_STORAGE_KEY = 'asd_music_volume';

/* === WORD BANKS === */
const WORDS = {
  short: [
    'ARC', 'BEAM', 'BYTE', 'CODE', 'COMET', 'CRUX', 'DATA', 'DRIFT', 'ECHO', 'FLARE',
    'FLUX', 'GLINT', 'ION', 'LASER', 'LUNAR', 'MARS', 'NOVA', 'ORBIT', 'PHASE', 'PULSE',
    'QUARK', 'RADAR', 'RIFT', 'ROVER', 'SOLAR', 'SONAR', 'SPARK', 'STAR', 'SURGE', 'TESLA',
    'TRACE', 'VAPOR', 'VOLT', 'WARP', 'XENON', 'ZENITH', 'ASTRO', 'BLINK', 'CIRCU', 'DELTA',
    'EMBER', 'FIELD', 'GHOST', 'HELIX', 'INDEX', 'JOLT', 'KAPPA', 'LIGHT', 'METAL', 'NERVE',
    'OMEGA', 'PIXEL', 'QUICK', 'RELAY', 'SCOPE', 'TITAN', 'ULTRA', 'VIRAL', 'WAVEL', 'YIELD'
  ],
  medium: [
    'ANTENNA', 'ASTEROID', 'BARRIER', 'CALIBER', 'CAPSULE', 'CIRCUIT', 'COMMAND', 'COSMIC',
    'DEFLECT', 'DOPPLER', 'ECLIPSE', 'ENERGY', 'FISSION', 'GALAXY', 'GRAVITY', 'HORIZON',
    'IGNITER', 'JAVELIN', 'KEYCODE', 'LAUNCH', 'MATRIX', 'NEBULA', 'ORBITAL', 'PHOTON',
    'PLASMA', 'QUANTUM', 'RADIANT', 'REACTOR', 'SATCOM', 'SECTOR', 'SHUTTLE', 'SPECTER',
    'STATION', 'TACHYON', 'TELEMETRY', 'THRUSTER', 'UPLINK', 'VECTOR', 'VOYAGER', 'WARHEAD',
    'XENOLITH', 'YARDARM', 'ZEROING', 'AIRLOCK', 'BINARY', 'CHARGE', 'DRONE', 'ENCRYPT',
    'FALCON', 'GATEWAY', 'HACKER', 'IMPACT', 'JETPACK', 'KINETIC', 'LATTICE', 'MODULE',
    'NETWORK', 'OUTPOST', 'PYLON', 'QUASAR', 'RHYTHM', 'SENSOR', 'TERMINAL', 'VORTEX'
  ],
  long: [
    'ATMOSPHERIC', 'BIOFREQUENCY', 'CRYPTOGRAPHY', 'DIMENSIONAL', 'ELECTROMAGNET', 'FORTIFICATION',
    'GEOSTATIONARY', 'HYPERDRIVE', 'INTERCEPTOR', 'JUMPSTATION', 'KILOMETER', 'LIGHTSPEED',
    'MAGNETOSPHERE', 'NAVIGATION', 'OBSERVATORY', 'PHOTONCANNON', 'QUARANTINE', 'RECONNAISSANCE',
    'SUBROUTINE', 'TRANSMISSION', 'ULTRAVIOLET', 'VELOCIMETER', 'WAVELENGTH', 'XENOBIOLOGY',
    'YOTTABYTE', 'ZEROPOINT', 'ASTROLABE', 'BATTLECRUISER', 'COUNTERSIGNAL', 'DECOMPRESSION',
    'EXOPLANETARY', 'FREQUENCYLOCK', 'GRAVITATIONAL', 'HARMONIZATION', 'IONIZATION', 'JAMMINGFIELD',
    'KRYPTONITE', 'LONGITUDE', 'MICROSATELLITE', 'NEUTRINOBEAM', 'OVERCHARGING', 'PULSARARRAY'
  ],
  boss: [
    ['INTERGALACTICOVERRIDE', 'QUANTUMFIREWALLBREACH', 'CORETERMINATIONSEQUENCE'],
    ['TRANSDIMENSIONALINFILTRATE', 'CRYPTONEXUSDECRYPTION', 'COMMANDMATRIXCOLLAPSE'],
    ['HYPERSPACEBROADCASTARRAY', 'SIGNALDISRUPTIONPROTOCOL', 'PLANETARYUPLINKSEVERANCE'],
    ['EXTRATERRESTRIALFIREWALL', 'GRAVITONSHIELDCOLLAPSE', 'ORIGINCOMMANDNULLIFIER'],
    ['BLACKOUTTRANSMISSIONFIELD', 'SEVERANCECASCADEPROTOCOL', 'MOTHERSHIPCONTROLLOCK']
  ],
  bossEasy: [
    ['OVERRIDE', 'TERMINATE', 'CORE'],
    ['INFILTRATE', 'DECRYPT', 'NEXUS'],
    ['BROADCAST', 'DISRUPT', 'SIGNAL']
  ],
  bossHard: [
    ['INTERGALACTICQUANTUMOVERRIDE', 'TRANSDIMENSIONALFIREWALLBREACH', 'CORETERMINATIONSEQUENCEALPHA'],
    ['EXTRATERRESTRIALINFILTRATION', 'CRYPTONEXUSDECRYPTIONCASCADE', 'COMMANDMATRIXCOLLAPSEPROTOCOL'],
    ['HYPERSPACEBROADCASTARRAYLOCK', 'PLANETARYSIGNALDISRUPTIONFIELD', 'MOTHERSHIPCONTROLSEVERANCE']
  ],
  hard: [
    'TRANSDIMENSIONAL', 'ELECTROMAGNETIC', 'COUNTERTRANSMISSION', 'SIGNATUREDECRYPTION',
    'HYPERCOMMUNICATION', 'SUBSPACEFREQUENCY', 'ATMOSPHERICINTERCEPT', 'QUANTUMDESTABILIZER',
    'NEUTRINOBROADCAST', 'GRAVITONRESONANCE', 'PHOTONICAMPLIFIER', 'XENOLINGUISTICCODE'
  ],
  powerups: ['JAMMER', 'EMP', 'SHIELD', 'SCAN']
};

/* === DOM & CANVAS === */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const typingInput = document.getElementById('typingInput');
const titleScreen = document.getElementById('titleScreen');
const waveOverlay = document.getElementById('waveOverlay');
const waveText = document.getElementById('waveText');
const upgradeShop = document.getElementById('upgradeShop');
const upgradeGrid = document.getElementById('upgradeGrid');
const powerToast = document.getElementById('powerToast');
const difficultyButtons = document.querySelectorAll('.difficulty-button');
const themeToggle = document.getElementById('themeToggle');
const gameMusic = document.getElementById('gameMusic');
const musicVolume = document.getElementById('musicVolume');
const musicDownButton = document.getElementById('musicDownButton');
const musicUpButton = document.getElementById('musicUpButton');
const musicMuteButton = document.getElementById('musicMuteButton');
const musicVolumeValue = document.getElementById('musicVolumeValue');

/* === GAME STATE === */
const State = {
  phase: 'title',
  wave: 0,
  score: 0,
  researchPoints: 0,
  hp: CONFIG.player.startHp,
  activeShips: [],
  particles: [],
  targetShip: null,
  powerupActive: null,
  upgrades: {
    forgiveness: false,
    attackBonus: false,
    extraHp: false,
    cooldown: false,
    allowedErrors: 0,
    splashKill: false,
    powerupRateBonus: 0
  },
  enemiesThisWave: 0,
  enemiesSpawned: 0,
  enemiesDefeated: 0,
  spawnTimer: 0,
  powerupTimer: 0,
  frameTime: 0,
  highScore: 0,
  difficulty: 'medium',
  gameSessionId: null,
  nextId: 1,
  stars: [],
  scanUntil: 0,
  player: null,
  waveLog: [],
  waveResearchThisWave: 0,
  audio: {
    ctx: null,
    master: null,
    sfxGain: null,
    musicGain: null,
    musicTimer: null,
    musicIndex: 0
  }
};

/* === UPGRADE SYSTEM === */
const UPGRADES = {
  forgiveness: {
    label: 'Typing Forgiveness',
    description: "Next wave: mistakes don't reset progress.",
    cost: 75,
    effect() {
      State.upgrades.allowedErrors = 1;
    }
  },
  attackBonus: {
    label: 'Signal Amplifier',
    description: 'Next wave: correct word destroys one nearby ship too.',
    cost: 120,
    effect() {
      State.upgrades.splashKill = true;
    }
  },
  extraHp: {
    label: 'Emergency Hull Patch',
    description: 'Consume now: restore 2 HP.',
    cost: 80,
    effect() {
      State.hp = Math.min(State.hp + 2, CONFIG.player.maxHp);
    }
  },
  cooldown: {
    label: 'Power Core',
    description: 'Next wave: power-up words spawn 30% more often.',
    cost: 60,
    effect() {
      State.upgrades.powerupRateBonus = 0.3;
    }
  }
};

/* === STORAGE === */
const Storage = {
  load() {
    State.highScore = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
  },
  save() {
    localStorage.setItem(STORAGE_KEY, String(State.highScore));
  }
};

/* === PLAYER ACCOUNT === */
const PlayerAuth = {
  async load() {
    try {
      const response = await fetch('/api/player/me');
      const data = await response.json();
      State.player = data.player || null;
    } catch (error) {
      State.player = null;
    }
    this.render();
  },
  render() {
    const accountNotLoggedIn = document.getElementById('accountNotLoggedIn');
    const accountLoggedInPlayer = document.getElementById('accountLoggedInPlayer');
    if (!accountNotLoggedIn || !accountLoggedInPlayer) return;
    if (State.player) {
      accountNotLoggedIn.hidden = true;
      accountLoggedInPlayer.hidden = false;
      document.getElementById('accountUsernameDisplay').textContent = State.player.username;
    } else {
      accountNotLoggedIn.hidden = false;
      accountLoggedInPlayer.hidden = true;
    }
  },
  async logout() {
    try {
      await fetch('/api/player/logout', { method: 'POST' });
    } catch (error) {
      /* ignore network errors on logout */
    }
    State.player = null;
    this.render();
    window.location.href = 'player-login.html';
  },
  async saveRun(result) {
    const statusNode = document.getElementById('saveStatus');
    if (!State.player || !State.gameSessionId) {
      if (statusNode) {
        statusNode.textContent = 'Log in to save this run to your account.';
        statusNode.className = 'save-status';
      }
      return;
    }
    if (statusNode) {
      statusNode.textContent = 'Saving run...';
      statusNode.className = 'save-status';
    }
    try {
      const response = await fetch(`/api/player/games/${State.gameSessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          final_score: State.score,
          highest_wave: State.wave,
          result,
          difficulty: State.difficulty,
          enemies_defeated: State.enemiesDefeated,
          research_points: State.researchPoints,
          waves: State.waveLog
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not save run.');
      State.gameSessionId = null;
      State.player = data.player;
      State.highScore = Number(data.highest_score || State.highScore);
      updateScoreLabels();
      this.render();
      if (statusNode) {
        statusNode.textContent = 'Run saved to your account.';
        statusNode.className = 'save-status success';
      }
      document.getElementById('finalHighScore').textContent = State.highScore.toLocaleString();
      return data;
    } catch (error) {
      if (statusNode) {
        statusNode.textContent = error.message || 'Could not save run.';
        statusNode.className = 'save-status error';
      }
    }
  }
};

const PlayerReports = {
  async request(path) {
    const response = await fetch(path);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Could not load player data.');
    return data;
  },
  setMessage(id, message, error = false) {
    const node = document.getElementById(id);
    node.textContent = message;
    node.className = error ? 'menu-status error' : 'menu-status';
  },
  async loadScores() {
    this.setMessage('scoresMessage', 'Loading score history...');
    try {
      const data = await this.request('/api/player/scores');
      const list = document.getElementById('scoresList');
      list.replaceChildren();
      if (!data.scores.length) {
        this.setMessage('scoresMessage', 'No game history yet. Start your first game!');
        return;
      }
      list.append(this.header(['Date', 'Difficulty', 'Wave Reached', 'Score']));
      data.scores.forEach(score => list.append(this.row([
        new Date(score.ended_at).toLocaleDateString(), score.difficulty.toUpperCase(), `WAVE ${score.highest_wave}`, Number(score.final_score).toLocaleString()
      ])));
      this.setMessage('scoresMessage', 'Latest completed runs');
    } catch (error) {
      this.setMessage('scoresMessage', error.message, true);
    }
  },
  async loadLeaderboard() {
    this.setMessage('leaderboardMessage', 'Loading leaderboard...');
    try {
      const data = await this.request('/api/player/leaderboard');
      const list = document.getElementById('leaderboardList');
      list.replaceChildren(this.header(['Player', 'Difficulty', 'Wave', 'Score']));
      data.leaderboard.forEach((score, index) => list.append(this.row([
        `#${index + 1} ${score.username}`, score.difficulty.toUpperCase(), `WAVE ${score.highest_wave}`, Number(score.final_score).toLocaleString()
      ])));
      if (!data.leaderboard.length) this.setMessage('leaderboardMessage', 'No completed games yet.');
      else this.setMessage('leaderboardMessage', 'Top completed runs');
    } catch (error) {
      this.setMessage('leaderboardMessage', error.message, true);
    }
  },
  async loadProgress() {
    this.setMessage('progressMessage', 'Loading player progress...');
    try {
      const data = await this.request('/api/player/progress');
      const progress = data.progress;
      const grid = document.getElementById('progressGrid');
      grid.replaceChildren(...[
        ['Games Played', progress.games_played],
        ['Highest Score', Number(progress.highest_score).toLocaleString()],
        ['Highest Wave', progress.highest_wave],
        ['Enemies Defeated', progress.enemies_defeated],
        ['Average Score', Number(progress.average_score).toLocaleString()],
        ['Last Played', progress.last_played ? new Date(progress.last_played).toLocaleDateString() : 'None']
      ].map(([label, value]) => {
        const card = document.createElement('div');
        card.className = 'progress-card';
        const name = document.createElement('span');
        name.textContent = label;
        const amount = document.createElement('strong');
        amount.textContent = value;
        card.append(name, amount);
        return card;
      }));
      this.setMessage('progressMessage', 'Calculated from your completed games');
    } catch (error) {
      this.setMessage('progressMessage', error.message, true);
    }
  },
  header(labels) {
    const node = document.createElement('div');
    node.className = 'data-row header';
    labels.forEach(label => {
      const cell = document.createElement('span');
      cell.textContent = label;
      node.append(cell);
    });
    return node;
  },
  row(values) {
    const node = document.createElement('div');
    node.className = 'data-row';
    values.forEach(value => {
      const cell = document.createElement('span');
      cell.textContent = value;
      node.append(cell);
    });
    return node;
  }
};

/* === ADMIN ACCOUNT === */
const AdminAuth = {
  admin: null,
  async load() {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      this.admin = data.admin || null;
    } catch (error) {
      this.admin = null;
    }
    this.render();
  },
  render() {
    const adminMenuButton = document.getElementById('adminMenuButton');
    const accountLoggedInAdmin = document.getElementById('accountLoggedInAdmin');
    if (!adminMenuButton) return;
    if (this.admin) {
      adminMenuButton.hidden = false;
      if (accountLoggedInAdmin) {
        accountLoggedInAdmin.hidden = false;
        document.getElementById('accountAdminUsernameDisplay').textContent = this.admin.username;
      }
    } else {
      adminMenuButton.hidden = true;
      if (accountLoggedInAdmin) {
        accountLoggedInAdmin.hidden = true;
      }
    }
  },
  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      /* ignore network errors on logout */
    }
    this.admin = null;
    this.render();
    MenuSystem.showMainMenu();
  }
};

/* === MENU SYSTEM WITH NAVIGATION HISTORY === */
const MenuSystem = {
  currentMenu: 'main',
  history: ['main'],
  
  init() {
    document.getElementById('playMenuButton').addEventListener('click', () => this.goToScreen('play'));
    document.getElementById('accountMenuButton').addEventListener('click', () => this.goToScreen('account'));
    document.getElementById('leaderboardMenuButton').addEventListener('click', () => {
      this.goToScreen('leaderboard');
      PlayerReports.loadLeaderboard();
    });
    document.getElementById('scoresMenuButton').addEventListener('click', () => {
      this.goToScreen('scores');
      PlayerReports.loadScores();
    });
    document.getElementById('progressMenuButton').addEventListener('click', () => {
      this.goToScreen('progress');
      PlayerReports.loadProgress();
    });
    document.getElementById('adminMenuButton').addEventListener('click', () => this.redirectToAdminConsole());
    document.getElementById('backFromPlayButton').addEventListener('click', () => this.goBack());
    document.getElementById('backFromAccountButton').addEventListener('click', () => this.goBack());
    document.getElementById('backFromLeaderboardButton').addEventListener('click', () => this.goBack());
    document.getElementById('backFromScoresButton').addEventListener('click', () => this.goBack());
    document.getElementById('backFromProgressButton').addEventListener('click', () => this.goBack());
    
    // Handle navigation to auth pages
    document.querySelectorAll('[data-nav]').forEach(link => {
      link.addEventListener('click', () => {
        const returnUrl = 'index.html?menuState=' + this.currentMenu;
        sessionStorage.setItem('navReturnUrl', returnUrl);
      });
    });
    
    // Player logout button
    const logoutPlayerBtn = document.getElementById('logoutButtonPlayer');
    if (logoutPlayerBtn) {
      logoutPlayerBtn.addEventListener('click', () => {
        PlayerAuth.logout();
      });
    }
    
    // Admin logout button
    const logoutAdminBtn = document.getElementById('logoutButtonAdmin');
    if (logoutAdminBtn) {
      logoutAdminBtn.addEventListener('click', () => {
        AdminAuth.logout();
      });
    }
  },
  
  showMenuScreen(screenId) {
    document.querySelectorAll('.menu-screen').forEach(screen => {
      screen.classList.remove('active');
    });
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.add('active');
      this.currentMenu = screenId.replace('Menu', '').toLowerCase();
    }
  },
  
  goToScreen(screenName) {
    const screenMap = {
      'main': 'mainMenu',
      'play': 'playMenu',
      'account': 'accountMenu',
      'leaderboard': 'leaderboardMenu',
      'scores': 'scoresMenu',
      'progress': 'progressMenu'
    };
    const screenId = screenMap[screenName];
    if (screenId) {
      this.history.push(screenName);
      this.showMenuScreen(screenId);
      this.scrollToTop();
    }
  },
  
  goBack() {
    if (this.history.length > 1) {
      this.history.pop();
      const previousScreen = this.history[this.history.length - 1];
      const screenMap = {
        'main': 'mainMenu',
        'play': 'playMenu',
        'account': 'accountMenu',
        'leaderboard': 'leaderboardMenu',
        'scores': 'scoresMenu',
        'progress': 'progressMenu'
      };
      this.showMenuScreen(screenMap[previousScreen]);
      this.scrollToTop();
    } else {
      this.showMainMenu();
    }
  },
  
  showMainMenu() {
    this.history = ['main'];
    this.showMenuScreen('mainMenu');
    this.scrollToTop();
  },
  
  redirectToAdminConsole() {
    if (AdminAuth.admin) {
      sessionStorage.setItem('navReturnUrl', 'index.html');
      window.location.href = 'admin.html';
    } else {
      sessionStorage.setItem('navReturnUrl', 'index.html?fromAuth=true');
      window.location.href = 'admin-login.html';
    }
  },
  
  scrollToTop() {
    const titleScreen = document.getElementById('titleScreen');
    if (titleScreen) {
      titleScreen.scrollTop = 0;
    }
  },
  
  restoreMenuState() {
    const params = new URLSearchParams(window.location.search);
    const menuState = params.get('menuState');
    const screenMap = {
      'main': 'mainMenu',
      'play': 'playMenu',
      'account': 'accountMenu',
      'leaderboard': 'leaderboardMenu',
      'scores': 'scoresMenu',
      'progress': 'progressMenu'
    };
    if (menuState && screenMap[menuState]) {
      this.history = [menuState];
      this.showMenuScreen(screenMap[menuState]);
      this.scrollToTop();
    }
  }
};

const Theme = {
  load() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    this.apply(savedTheme === 'day' ? 'day' : 'night', false);
  },
  apply(theme, persist = true) {
    document.body.dataset.theme = theme;
    const styles = getComputedStyle(document.body);
    const tokens = {
      void: '--void', grid: '--grid', blue: '--neon-blue', purple: '--neon-purple',
      green: '--neon-green', red: '--warning-red', orange: '--neon-orange', dim: '--text-dim', bright: '--text-bright',
      earthCore: '--earth-core', earthMid: '--earth-mid', earthEdge: '--earth-edge',
      bossTrack: '--boss-track', hudEmpty: '--hud-empty'
    };
    Object.entries(tokens).forEach(([key, token]) => {
      COLORS[key] = styles.getPropertyValue(token).trim();
    });
    themeToggle.querySelector('.theme-toggle-icon').textContent = theme === 'day' ? '☾' : '☀';
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'day' ? 'night' : 'day'} mode`);
    themeToggle.setAttribute('title', themeToggle.getAttribute('aria-label'));
    themeToggle.setAttribute('aria-pressed', String(theme === 'day'));
    if (persist) localStorage.setItem(THEME_STORAGE_KEY, theme);
    render();
  },
  toggle() {
    this.apply(document.body.dataset.theme === 'day' ? 'night' : 'day');
  }
};

/* === AUDIO SYSTEM === */
const AudioSystem = {
  loadMusicSettings() {
    const savedVolume = Number(localStorage.getItem(MUSIC_VOLUME_STORAGE_KEY));
    const volume = Number.isFinite(savedVolume) ? Math.max(0, Math.min(1, savedVolume)) : CONFIG.audio.musicVolume;
    this.setMusicVolume(volume, false);
  },
  ensure() {
    if (!State.audio.ctx) this.createGraph();
    if (State.audio.ctx.state === 'suspended') State.audio.ctx.resume();
  },
  createGraph() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    const sfxGain = ctx.createGain();
    const musicGain = ctx.createGain();
    master.gain.value = CONFIG.audio.masterVolume;
    sfxGain.gain.value = CONFIG.audio.sfxVolume;
    musicGain.gain.value = CONFIG.audio.musicVolume;
    sfxGain.connect(master);
    musicGain.connect(master);
    master.connect(ctx.destination);
    Object.assign(State.audio, { ctx, master, sfxGain, musicGain });
  },
  startMusic(restart = false) {
    this.ensure();
    if (!gameMusic) return;
    if (restart) gameMusic.currentTime = 0;
    gameMusic.play().catch(() => {});
  },
  stopMusic() {
    if (gameMusic) gameMusic.pause();
  },
  setMusicVolume(volume, persist = true) {
    const normalizedVolume = Math.max(0, Math.min(1, Number(volume) || 0));
    if (gameMusic) gameMusic.volume = normalizedVolume;
    if (musicVolume) musicVolume.value = String(Math.round(normalizedVolume * 100));
    if (musicVolumeValue) musicVolumeValue.value = `${Math.round(normalizedVolume * 100)}%`;
    if (musicMuteButton) {
      const muted = normalizedVolume === 0;
      musicMuteButton.textContent = muted ? 'ON' : 'MUTE';
      musicMuteButton.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
      musicMuteButton.setAttribute('title', muted ? 'Unmute music' : 'Mute music');
      musicMuteButton.setAttribute('aria-pressed', String(muted));
    }
    if (persist) localStorage.setItem(MUSIC_VOLUME_STORAGE_KEY, String(normalizedVolume));
  },
  adjustMusicVolume(amount) {
    this.setMusicVolume(Number(musicVolume.value) / 100 + amount);
  },
  toggleMusicMute() {
    const currentVolume = Number(musicVolume.value) / 100;
    this.setMusicVolume(currentVolume > 0 ? 0 : CONFIG.audio.musicVolume);
  },
  playTyping() {
    this.playTone({ frequency: randomRange(720, 860), duration: 0.045, type: 'square', gain: 0.08 });
  },
  playDefeat(type) {
    const base = type === 'mothership' ? 130 : 240;
    this.playSweep({ from: base * 2.2, to: base, duration: 0.22, type: 'sawtooth', gain: 0.18 });
    setTimeout(() => this.playNoise(0.12, 0.16), 35);
  },
  playPowerup() {
    [440, 660, 880].forEach((note, index) => {
      setTimeout(() => this.playTone({ frequency: note, duration: 0.11, type: 'triangle', gain: 0.1 }), index * 70);
    });
  },
  playDamage() {
    this.playSweep({ from: 180, to: 70, duration: 0.28, type: 'sawtooth', gain: 0.16 });
  },
  playGameOver() {
    this.playSweep({ from: 220, to: 42, duration: 0.75, type: 'triangle', gain: 0.2 });
  },
  playWave() {
    this.playTone({ frequency: 196, duration: 0.14, type: 'triangle', gain: 0.1 });
    setTimeout(() => this.playTone({ frequency: 392, duration: 0.2, type: 'triangle', gain: 0.1 }), 120);
  },
  playMusicPulse() {
    if (!State.audio.ctx || State.phase === 'title' || State.phase === 'gameover') return;
    const notes = CONFIG.audio.musicNotes;
    const note = notes[State.audio.musicIndex % notes.length];
    State.audio.musicIndex += randomInt(1, 2);
    this.playTone({
      frequency: note,
      duration: 0.42,
      type: 'sine',
      gain: 0.045,
      destination: State.audio.musicGain
    });
    this.playTone({
      frequency: note * 2.01,
      duration: 0.2,
      type: 'triangle',
      gain: 0.018,
      destination: State.audio.musicGain
    });
  },
  playTone({ frequency, duration, type, gain, destination }) {
    if (!State.audio.ctx) return;
    const ctx = State.audio.ctx;
    const out = destination || State.audio.sfxGain;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    amp.gain.setValueAtTime(0.0001, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(amp);
    amp.connect(out);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  },
  playSweep({ from, to, duration, type, gain }) {
    if (!State.audio.ctx) return;
    const ctx = State.audio.ctx;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(to, ctx.currentTime + duration);
    amp.gain.setValueAtTime(gain, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(amp);
    amp.connect(State.audio.sfxGain);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.03);
  },
  playNoise(duration, gain) {
    if (!State.audio.ctx) return;
    const ctx = State.audio.ctx;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = randomRange(-1, 1);
    const noise = ctx.createBufferSource();
    const amp = ctx.createGain();
    noise.buffer = buffer;
    amp.gain.setValueAtTime(gain, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    noise.connect(amp);
    amp.connect(State.audio.sfxGain);
    noise.start();
  }
};

/* === INITIALIZATION === */
function init() {
  Storage.load();
  Theme.load();
  PlayerAuth.load();
  AdminAuth.load();
  buildStars();
  updateScoreLabels();
  bindEvents();
  AudioSystem.loadMusicSettings();
  MenuSystem.init();
  MenuSystem.restoreMenuState();
  renderUpgradeShop();
  requestAnimationFrame(gameLoop);
}

function bindEvents() {
  document.getElementById('startButton').addEventListener('click', startGame);
  document.getElementById('restartButton').addEventListener('click', startGame);
  document.getElementById('exitGameOverButton').addEventListener('click', exitCompletedGame);
  document.getElementById('resumeButton').addEventListener('click', resumeGame);
  document.getElementById('pauseRestartButton').addEventListener('click', () => confirmPauseAction('restart'));
  document.getElementById('pauseExitButton').addEventListener('click', () => confirmPauseAction('exit'));
  document.getElementById('pauseConfirmButton').addEventListener('click', executePauseAction);
  document.querySelector('#pauseConfirmDialog [value="cancel"]').addEventListener('click', event => {
    event.preventDefault();
    document.getElementById('pauseConfirmDialog').close();
  });
  document.getElementById('continueButton').addEventListener('click', startNextWave);
  themeToggle.addEventListener('click', () => Theme.toggle());
  musicVolume.addEventListener('input', event => AudioSystem.setMusicVolume(Number(event.target.value) / 100));
  musicDownButton.addEventListener('click', () => AudioSystem.adjustMusicVolume(-0.05));
  musicUpButton.addEventListener('click', () => AudioSystem.adjustMusicVolume(0.05));
  musicMuteButton.addEventListener('click', () => AudioSystem.toggleMusicMute());
  difficultyButtons.forEach(button => {
    button.addEventListener('click', () => setDifficulty(button.dataset.difficulty));
  });
  typingInput.addEventListener('input', handleInput);
  canvas.addEventListener('click', focusInput);
  document.addEventListener('keydown', handleGlobalKey);
  window.addEventListener('resize', focusInput);
}

function handleGlobalKey(event) {
  if (event.code === 'Escape') {
    event.preventDefault();
    if (State.phase === 'playing') pauseGame();
    else if (State.phase === 'paused') resumeGame();
    return;
  }
  if (State.phase === 'playing') focusInput();
}

function pauseGame() {
  State.phase = 'paused';
  AudioSystem.stopMusic();
  typingInput.value = '';
  document.getElementById('pauseOverlay').classList.add('active');
}

function resumeGame() {
  if (State.phase !== 'paused') return;
  State.phase = 'playing';
  document.getElementById('pauseOverlay').classList.remove('active');
  AudioSystem.startMusic();
  focusInput();
}

let pendingPauseAction = null;

function confirmPauseAction(action) {
  pendingPauseAction = action;
  const dialog = document.getElementById('pauseConfirmDialog');
  document.getElementById('pauseConfirmTitle').textContent = action === 'restart' ? 'Restart Game?' : 'Exit to Main Menu?';
  document.getElementById('pauseConfirmMessage').textContent = action === 'restart'
    ? 'Are you sure you want to restart? Your current game progress will be lost.'
    : 'Are you sure you want to exit to the Main Menu? Your current game progress will be lost.';
  document.getElementById('pauseConfirmButton').textContent = action === 'restart' ? 'Confirm Restart' : 'Confirm Exit';
  dialog.showModal();
}

async function executePauseAction(event) {
  event.preventDefault();
  const action = pendingPauseAction;
  pendingPauseAction = null;
  document.getElementById('pauseConfirmDialog').close();
  await abandonCurrentGame();
  if (action === 'restart') {
    document.getElementById('pauseOverlay').classList.remove('active');
    await startGame();
    return;
  }
  State.gameSessionId = null;
  resetRun();
  AudioSystem.stopMusic();
  hideAllOverlays();
  document.getElementById('titleScreen').classList.add('active');
  MenuSystem.showMainMenu();
}

async function abandonCurrentGame() {
  if (!State.gameSessionId) return;
  try {
    await fetch(`/api/player/games/${State.gameSessionId}/abandon`, { method: 'POST' });
  } catch (error) {
    showToast('COULD NOT CLOSE GAME SESSION');
  }
}

function focusInput() {
  setTimeout(() => typingInput.focus(), 0);
}

function setDifficulty(difficulty) {
  State.difficulty = difficulty;
  difficultyButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.difficulty === difficulty);
  });
}

async function startGame() {
  if (!State.player) {
    MenuSystem.goToScreen('account');
    showToast('PLAYER LOGIN REQUIRED');
    return;
  }
  const response = await fetch('/api/player/games/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ difficulty: State.difficulty })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    showToast(data.error || 'COULD NOT START GAME');
    return;
  }
  State.gameSessionId = data.game.session_id;
  AudioSystem.ensure();
  AudioSystem.startMusic(true);
  resetRun();
  hideAllOverlays();
  startNextWave();
}

function resetRun() {
  CONFIG.player.maxHp = 5;
  Object.assign(State, {
    phase: 'title',
    wave: 0,
    score: 0,
    researchPoints: 0,
    hp: CONFIG.player.startHp,
    activeShips: [],
    particles: [],
    targetShip: null,
    powerupActive: null,
    enemiesThisWave: 0,
    enemiesSpawned: 0,
    enemiesDefeated: 0,
    spawnTimer: 0,
    powerupTimer: 0,
    scanUntil: 0,
    difficulty: State.difficulty,
    gameSessionId: State.gameSessionId,
    waveLog: [],
    waveResearchThisWave: 0
  });
  State.upgrades = {
    forgiveness: false,
    attackBonus: false,
    extraHp: false,
    cooldown: false,
    allowedErrors: 0,
    splashKill: false,
    powerupRateBonus: 0
  };
}

/* === GAME LOOP === */
function gameLoop(timestamp) {
  const dt = Math.min(40, timestamp - (State.frameTime || timestamp));
  State.frameTime = timestamp;
  update(dt);
  render();
  requestAnimationFrame(gameLoop);
}

function update(dt) {
  if (State.phase === 'playing') {
    spawnSystem.update(dt);
    shipMovement.update(dt);
    collisionCheck();
    powerupSystem.update();
    waveSystem.check();
  }
  particleSystem.update(dt);
}

/* === INPUT SYSTEM === */
function handleInput() {
  if (State.phase !== 'playing') {
    typingInput.value = '';
    return;
  }
  const typed = typingInput.value.toUpperCase().slice(-1);
  typingInput.value = '';
  if (!typed) return;
  AudioSystem.playTyping();
  resolveInput(typed);
}

function resolveInput(char) {
  const powerup = findMatchingShip(char, true);
  if (powerup) {
    progressShip(powerup);
    return;
  }

  if (State.targetShip && canProgress(State.targetShip, char)) {
    progressShip(State.targetShip);
    return;
  }

  if (State.targetShip) handleMistake(State.targetShip);
  const nextTarget = findMatchingShip(char, false);
  if (nextTarget) progressShip(nextTarget);
}

function canProgress(ship, char) {
  return ship.word[ship.progress] === char;
}

function progressShip(ship) {
  State.targetShip = ship.type === 'powerup' ? State.targetShip : ship;
  ship.progress += 1;
  ship.errors = 0;
  if (ship.progress >= ship.word.length) completeShipWord(ship);
}

function handleMistake(ship) {
  ship.errors = (ship.errors || 0) + 1;
  if (ship.errors > State.upgrades.allowedErrors) {
    ship.progress = 0;
    ship.errors = 0;
    State.targetShip = null;
  }
}

function findMatchingShip(char, powerupsOnly) {
  return State.activeShips
    .filter(ship => (powerupsOnly ? ship.type === 'powerup' : ship.type !== 'powerup'))
    .filter(ship => ship.word[ship.progress] === char)
    .sort((a, b) => b.y - a.y)[0] || null;
}

function completeShipWord(ship) {
  if (ship.type === 'powerup') {
    activatePowerup(ship);
    removeShip(ship, false);
    return;
  }
  if (ship.type === 'mothership' && ship.sequence.length > 0) {
    ship.word = ship.sequence.shift();
    ship.progress = 0;
    ship.hp = ship.sequence.length + 1;
    return;
  }
  destroyEnemy(ship, true);
}

/* === SPAWN SYSTEM === */
const spawnSystem = {
  update(dt) {
    State.spawnTimer -= dt;
    State.powerupTimer -= dt;
    if (State.spawnTimer <= 0 && State.enemiesSpawned < State.enemiesThisWave) {
      spawnShip();
      this.resetTimer();
    }
    if (State.powerupTimer <= 0) {
      spawnPowerup();
      this.resetPowerupTimer();
    }
  },
  resetTimer() {
    const interval = Math.max(
      CONFIG.spawn.minIntervalCap,
      CONFIG.spawn.minInterval - (State.wave - 1) * CONFIG.spawn.intervalDecay
    );
    State.spawnTimer = interval + (Math.random() - 0.5) * 400;
  },
  resetPowerupTimer() {
    const rate = 1 + State.upgrades.powerupRateBonus;
    const min = CONFIG.spawn.powerupMin / rate;
    const max = CONFIG.spawn.powerupMax / rate;
    State.powerupTimer = randomRange(min, max);
  }
};

function spawnShip() {
  const type = pickEnemyType();
  const lane = pickFreeLane();
  State.activeShips.push(buildEntity(type, lane));
  State.enemiesSpawned += 1;
}

function spawnPowerup() {
  if (State.phase !== 'playing') return;
  State.activeShips.push(buildEntity('powerup', pickFreeLane()));
}

function buildEntity(type, lane) {
  const config = TYPE_CONFIG[type];
  const x = laneX(lane);
  const sequence = type === 'mothership' ? buildBossSequence() : null;
  const word = sequence ? sequence.shift() : pickEntityWord(type, config.wordBank);
  return {
    id: State.nextId++,
    type,
    lane,
    x,
    y: -50,
    speed: config.speed * speedMultiplier(),
    baseSpeed: config.speed * speedMultiplier(),
    word,
    progress: 0,
    errors: 0,
    hp: sequence ? sequence.length + 1 : 1,
    sequence,
    powerupType: type === 'powerup' ? word : null,
    rotation: Math.random() * Math.PI
  };
}

function pickEntityWord(type, fallbackBank) {
  if (type === 'powerup') return randomItem(WORDS.powerups);
  const bank = DIFFICULTY_WORD_BANKS[State.difficulty]?.[type] || fallbackBank;
  return randomItem(WORDS[bank]);
}

function buildBossSequence() {
  const bossBank = {
    easy: WORDS.bossEasy,
    medium: WORDS.boss,
    hard: WORDS.bossHard
  }[State.difficulty] || WORDS.boss;
  return randomItem(bossBank).slice();
}

function pickEnemyType() {
  if (State.wave <= 2) return weightedPick({ scout: 80, assault: 20 });
  if (State.wave <= 4) return weightedPick({ scout: 50, assault: 40, carrier: 10 });
  if (State.wave <= 9) return rerollMothership(weightedPick({ scout: 30, assault: 40, carrier: 25, mothership: 5 }));
  return rerollMothership(weightedPick({ scout: 15, assault: 35, carrier: 35, mothership: 15 }));
}

function rerollMothership(type) {
  const bossActive = State.activeShips.some(ship => ship.type === 'mothership');
  return type === 'mothership' && bossActive ? 'carrier' : type;
}

function pickFreeLane() {
  const occupied = State.activeShips.filter(ship => ship.y < 130).map(ship => ship.lane);
  const lanes = Array.from({ length: CONFIG.spawn.laneCount }, (_, lane) => lane);
  const free = lanes.filter(lane => !occupied.includes(lane));
  return randomItem(free.length ? free : lanes);
}

/* === MOVEMENT & COLLISION === */
const shipMovement = {
  update(dt) {
    const frameScale = dt / 16.67;
    State.activeShips.forEach(ship => {
      ship.y += ship.speed * frameScale;
      ship.rotation += 0.04 * frameScale;
    });
  }
};

function collisionCheck() {
  const earthLine = CONFIG.canvas.height - CONFIG.earthZoneHeight;
  State.activeShips.slice().forEach(ship => {
    if (ship.y >= earthLine) damagePlayer(ship);
  });
}

function damagePlayer(ship) {
  removeShip(ship, ship.type !== 'powerup');
  if (ship.type === 'powerup') return;
  State.hp -= 1;
  AudioSystem.playDamage();
  triggerDamageFlash();
  if (State.hp <= 0) triggerGameOver();
}

/* === POWER-UP SYSTEM === */
const POWERUP_EFFECTS = {
  JAMMER() {
    State.activeShips.forEach(ship => {
      if (ship.type !== 'powerup') ship.speed = ship.baseSpeed * 0.5;
    });
    State.powerupActive = { type: 'JAMMER', expiresAt: Date.now() + CONFIG.effects.jammerDuration };
    showToast('JAMMER ACTIVE - SHIPS SLOWED');
  },
  EMP() {
    State.activeShips.slice().forEach(ship => {
      if (ship.type === 'scout' || ship.type === 'assault') destroyEnemy(ship, false);
    });
    showToast('EMP DISCHARGED');
  },
  SHIELD() {
    State.hp = Math.min(State.hp + 1, CONFIG.player.maxHp);
    showToast('SHIELD RESTORED +1 HP');
  },
  SCAN() {
    State.spawnTimer += CONFIG.effects.scanDelay;
    State.scanUntil = Date.now() + CONFIG.effects.scanDelay;
    showToast('SCAN ACTIVE - TARGETS REVEALED');
  }
};

const powerupSystem = {
  update() {
    if (!State.powerupActive || Date.now() < State.powerupActive.expiresAt) return;
    if (State.powerupActive.type === 'JAMMER') {
      State.activeShips.forEach(ship => {
        ship.speed = ship.baseSpeed;
      });
    }
    State.powerupActive = null;
  }
};

function activatePowerup(ship) {
  AudioSystem.playPowerup();
  POWERUP_EFFECTS[ship.powerupType]();
  spawnExplosion(ship, TYPE_CONFIG.powerup.colorKey);
}

/* === WAVE SYSTEM === */
const waveSystem = {
  check() {
    const waveDone = State.enemiesSpawned >= State.enemiesThisWave &&
      State.enemiesDefeated >= State.enemiesThisWave &&
      !State.activeShips.some(ship => ship.type !== 'powerup');
    if (waveDone) endWave();
  }
};

function startNextWave() {
  hideAllOverlays();
  State.wave += 1;
  State.enemiesThisWave = CONFIG.wave.enemiesPerWave + (State.wave - 1) * CONFIG.wave.enemiesScaling;
  State.enemiesSpawned = 0;
  State.enemiesDefeated = 0;
  State.waveResearchThisWave = 0;
  State.activeShips = State.activeShips.filter(ship => ship.type === 'powerup');
  State.targetShip = null;
  State.phase = 'wave_end';
  AudioSystem.startMusic();
  AudioSystem.playWave();
  showWaveAnnouncement(`WAVE ${State.wave} - INCOMING`);
  setTimeout(() => {
    if (State.phase !== 'wave_end') return;
    State.phase = 'playing';
    spawnSystem.resetTimer();
    spawnSystem.resetPowerupTimer();
    focusInput();
  }, CONFIG.wave.announcementTime);
}

function endWave() {
  State.phase = 'upgrade';
  State.waveLog.push({
    wave_number: State.wave,
    enemies_defeated: State.enemiesDefeated,
    research_points_earned: State.waveResearchThisWave,
    survived: true
  });
  clearConsumableEffects();
  State.score += CONFIG.research.scorePerWave;
  State.researchPoints += CONFIG.research.scorePerWave;
  State.activeShips = [];
  State.targetShip = null;
  updateHighScore();
  showUpgradeShop();
}

function clearConsumableEffects() {
  State.upgrades.forgiveness = false;
  State.upgrades.attackBonus = false;
  State.upgrades.extraHp = false;
  State.upgrades.cooldown = false;
  State.upgrades.allowedErrors = 0;
  State.upgrades.splashKill = false;
  State.upgrades.powerupRateBonus = 0;
}

function triggerGameOver() {
  if (State.phase === 'gameover') return;
  State.phase = 'gameover';
  State.activeShips = [];
  State.waveLog.push({
    wave_number: State.wave,
    enemies_defeated: State.enemiesDefeated,
    research_points_earned: State.waveResearchThisWave,
    survived: false
  });
  AudioSystem.playGameOver();
  AudioSystem.stopMusic();
  updateHighScore();
  document.getElementById('finalScore').textContent = State.score.toLocaleString();
  document.getElementById('finalDifficulty').textContent = capitalizeDifficulty(State.difficulty);
  document.getElementById('finalWave').textContent = State.wave;
  document.getElementById('finalHighScore').textContent = '...';
  document.getElementById('saveStatus').textContent = '';
  document.getElementById('saveStatus').className = 'save-status';
  hideAllOverlays();
  document.getElementById('gameOverScreen').classList.add('active');
  PlayerAuth.saveRun('lost');
}

function capitalizeDifficulty(difficulty) {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function exitCompletedGame() {
  State.gameSessionId = null;
  resetRun();
  AudioSystem.stopMusic();
  hideAllOverlays();
  document.getElementById('titleScreen').classList.add('active');
  MenuSystem.showMainMenu();
}

/* === SCORING & REMOVAL === */
function destroyEnemy(ship, awardScore) {
  if (awardScore) {
    const points = CONFIG.research.scorePerKill[ship.type] || 0;
    State.score += points;
    State.researchPoints += points;
    State.waveResearchThisWave += points;
  }
  State.enemiesDefeated += ship.type === 'powerup' ? 0 : 1;
  AudioSystem.playDefeat(ship.type);
  spawnExplosion(ship, TYPE_CONFIG[ship.type].colorKey);
  removeShip(ship, false);
  if (awardScore && State.upgrades.splashKill) splashDestroy(ship);
}

function splashDestroy(sourceShip) {
  const nearby = State.activeShips
    .filter(ship => ship.type !== 'powerup')
    .map(ship => ({ ship, dist: Math.hypot(ship.x - sourceShip.x, ship.y - sourceShip.y) }))
    .sort((a, b) => a.dist - b.dist)[0];
  if (nearby && nearby.dist < 190) destroyEnemy(nearby.ship, false);
}

function removeShip(ship, countDefeat) {
  State.activeShips = State.activeShips.filter(item => item.id !== ship.id);
  if (State.targetShip && State.targetShip.id === ship.id) State.targetShip = null;
  if (countDefeat && ship.type !== 'powerup') State.enemiesDefeated += 1;
}

function updateHighScore() {
  if (State.score > State.highScore) {
    State.highScore = State.score;
    Storage.save();
  }
  updateScoreLabels();
}

/* === PARTICLE SYSTEM === */
const particleSystem = {
  update(dt) {
    const frameScale = dt / 16.67;
    State.particles.forEach(particle => {
      particle.x += particle.vx * frameScale;
      particle.y += particle.vy * frameScale;
      particle.life -= dt;
      particle.alpha = Math.max(0, particle.life / particle.maxLife);
    });
    State.particles = State.particles.filter(particle => particle.alpha > 0);
  }
};

function spawnExplosion(ship, colorKey) {
  const count = randomInt(CONFIG.particles.minExplosion, CONFIG.particles.maxExplosion);
  for (let i = 0; i < count; i++) {
    State.particles.push({
      x: ship.x,
      y: ship.y,
      vx: randomRange(-4, 4),
      vy: randomRange(-4, 4),
      alpha: 1,
      colorKey,
      life: randomRange(360, 720),
      maxLife: 720
    });
  }
}

/* === OVERLAYS === */
function hideAllOverlays() {
  document.querySelectorAll('.overlay').forEach(node => node.classList.remove('active'));
}

function showWaveAnnouncement(text) {
  waveText.textContent = text;
  waveOverlay.classList.add('active');
  setTimeout(() => waveOverlay.classList.remove('active'), CONFIG.wave.announcementTime);
}

function showUpgradeShop() {
  hideAllOverlays();
  renderUpgradeShop();
  upgradeShop.classList.add('active');
}

function renderUpgradeShop() {
  document.getElementById('shopResearch').textContent = State.researchPoints;
  upgradeGrid.replaceChildren(...Object.entries(UPGRADES).map(([key, upgrade]) => {
    const purchased = State.upgrades[key];
    const cost = upgrade.cost;
    const card = document.createElement('button');
    card.className = 'upgrade-card';
    card.disabled = purchased || State.researchPoints < cost;
    card.addEventListener('click', () => buyUpgrade(key));
    card.append(
      textNode('h3', upgrade.label),
      textNode('p', upgrade.description),
      buildUpgradeMeta(purchased, cost)
    );
    return card;
  }));
}

function buildUpgradeMeta(purchased, cost) {
  const row = document.createElement('div');
  row.className = 'upgrade-meta';
  const typeText = document.createElement('span');
  typeText.textContent = 'Consumable';
  const costText = document.createElement('span');
  costText.textContent = purchased ? 'Loaded' : `${cost} RP`;
  row.append(typeText, costText);
  return row;
}

function buyUpgrade(key) {
  const upgrade = UPGRADES[key];
  const cost = upgrade.cost;
  if (State.upgrades[key] || State.researchPoints < cost) return;
  State.researchPoints -= cost;
  State.upgrades[key] = true;
  upgrade.effect();
  renderUpgradeShop();
}

function showToast(message) {
  powerToast.textContent = message;
  powerToast.classList.add('active');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => powerToast.classList.remove('active'), 2000);
}

function triggerDamageFlash() {
  document.body.classList.remove('damage');
  void document.body.offsetWidth;
  document.body.classList.add('damage');
}

function updateScoreLabels() {
  document.getElementById('titleHighScore').textContent = State.highScore;
}

/* === RENDERING === */
function render() {
  ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
  drawBackground();
  drawEarth();
  drawShips();
  drawParticles();
  drawHUD();
}

function drawBackground() {
  ctx.fillStyle = COLORS.void;
  ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
  drawStars();
  drawGrid();
}

function buildStars() {
  State.stars = Array.from({ length: 160 }, () => ({
    x: Math.random() * CONFIG.canvas.width,
    y: Math.random() * CONFIG.canvas.height,
    r: Math.random() * 1.8 + 0.3,
    a: Math.random() * 0.65 + 0.25
  }));
}

function drawStars() {
  State.stars.forEach(star => {
    ctx.globalAlpha = star.a;
    ctx.fillStyle = COLORS.bright;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.8;
  for (let i = 0; i < CONFIG.spawn.laneCount; i++) {
    const x = laneX(i);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CONFIG.canvas.height - CONFIG.earthZoneHeight);
    ctx.stroke();
  }
  for (let r = 100; r < 620; r += 120) {
    ctx.beginPath();
    ctx.arc(CONFIG.canvas.width / 2, CONFIG.canvas.height - 40, r, Math.PI, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEarth() {
  const y = CONFIG.canvas.height + 36;
  const gradient = ctx.createRadialGradient(640, y, 80, 640, y, 690);
  gradient.addColorStop(0, COLORS.earthCore);
  gradient.addColorStop(0.45, COLORS.earthMid);
  gradient.addColorStop(1, COLORS.earthEdge);
  ctx.save();
  ctx.shadowBlur = 24;
  ctx.shadowColor = COLORS.green;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(640, y, 430, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawShips() {
  State.activeShips.forEach(ship => {
    drawTrail(ship);
    drawShipShape(ship);
    drawShipWord(ship);
    if (ship.type === 'mothership') drawBossHp(ship);
  });
}

function drawTrail(ship) {
  const gradient = ctx.createLinearGradient(ship.x, ship.y - 8, ship.x, ship.y + 58);
  gradient.addColorStop(0, `${shipColor(ship)}77`);
  gradient.addColorStop(1, `${shipColor(ship)}00`);
  ctx.fillStyle = gradient;
  ctx.fillRect(ship.x - 5, ship.y, 10, 62);
}

function drawShipShape(ship) {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  if (ship.type === 'powerup') ctx.rotate(ship.rotation);
  ctx.fillStyle = shipColor(ship);
  ctx.strokeStyle = COLORS.bright;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 18;
  ctx.shadowColor = shipColor(ship);
  drawPolygonForType(ship.type);
  ctx.restore();
}

function drawPolygonForType(type) {
  ctx.beginPath();
  if (type === 'scout') {
    pathPoints([[0, -24], [16, 0], [0, 28], [-16, 0]]);
  } else if (type === 'assault') {
    pathPoints([[0, 32], [28, -20], [8, -8], [0, -30], [-8, -8], [-28, -20]]);
  } else if (type === 'carrier') {
    pathPoints([[-40, -14], [-18, -34], [18, -34], [40, -14], [28, 28], [-28, 28]]);
  } else if (type === 'mothership') {
    pathPoints([[-58, -18], [-34, -44], [28, -48], [58, -20], [48, 28], [18, 48], [-28, 42], [-62, 12]]);
  } else {
    pathPoints([[0, -26], [26, 0], [0, 26], [-26, 0]]);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function pathPoints(points) {
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
}

function drawShipWord(ship) {
  const prefix = ship.word.slice(0, ship.progress);
  const suffix = ship.word.slice(ship.progress);
  const y = ship.y - TYPE_CONFIG[ship.type].radius - 18;
  const fontSize = ship.type === 'mothership' ? bossWordFontSize(ship.word) : 20;
  ctx.save();
  ctx.font = `${fontSize}px "Share Tech Mono"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fullWidth = ctx.measureText(ship.word).width;
  const startX = ship.x - fullWidth / 2;
  ctx.textAlign = 'left';
  ctx.shadowBlur = 12;
  ctx.shadowColor = prefix ? COLORS.blue : (ship.type === 'powerup' ? COLORS.purple : COLORS.dim);
  ctx.fillStyle = COLORS.blue;
  ctx.fillText(prefix, startX, y);
  if (prefix) drawUnderline(startX, y + 15, ctx.measureText(prefix).width);
  ctx.fillStyle = wordSuffixColor(ship);
  ctx.fillText(suffix, startX + ctx.measureText(prefix).width, y);
  ctx.restore();
}

function bossWordFontSize(word) {
  if (word.length > 24) return 15;
  if (word.length > 20) return 17;
  return 19;
}

function wordSuffixColor(ship) {
  if (ship.type === 'powerup') return COLORS.purple;
  if (Date.now() < State.scanUntil) return COLORS.bright;
  return COLORS.dim;
}

function shipColor(ship) {
  return COLORS[TYPE_CONFIG[ship.type].colorKey];
}

function drawUnderline(x, y, width) {
  ctx.strokeStyle = COLORS.blue;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.stroke();
}

function drawBossHp(ship) {
  const width = 88;
  const filled = width * (ship.hp / 3);
  ctx.fillStyle = COLORS.bossTrack;
  ctx.fillRect(ship.x - width / 2, ship.y + 64, width, 8);
  ctx.fillStyle = COLORS.red;
  ctx.fillRect(ship.x - width / 2, ship.y + 64, filled, 8);
}

function drawParticles() {
  State.particles.forEach(particle => {
    ctx.globalAlpha = particle.alpha;
    ctx.fillStyle = COLORS[particle.colorKey];
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawHUD() {
  if (State.phase === 'title' || State.phase === 'gameover') return;
  ctx.save();
  ctx.font = '18px "Orbitron"';
  ctx.fillStyle = COLORS.dim;
  ctx.fillText('SCORE', 28, 34);
  ctx.fillText('WAVE', 28, 78);
  ctx.fillStyle = COLORS.bright;
  ctx.fillText(String(State.score), 120, 34);
  ctx.fillText(String(State.wave), 120, 78);
  drawHp();
  drawResearch();
  drawPowerIndicator();
  ctx.restore();
}

function drawHp() {
  ctx.font = '18px "Orbitron"';
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.dim;
  ctx.fillText('HP', 1070, 34);
  for (let i = 0; i < CONFIG.player.maxHp; i++) {
    ctx.fillStyle = i < State.hp ? COLORS.green : COLORS.hudEmpty;
    ctx.fillText('◆', 1100 + i * 24, 34);
  }
}

function drawResearch() {
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.dim;
  ctx.fillText('RP', 1138, 78);
  ctx.fillStyle = COLORS.green;
  ctx.fillText(String(State.researchPoints), 1248, 78);
}

function drawPowerIndicator() {
  if (!State.powerupActive) return;
  const seconds = Math.max(0, Math.ceil((State.powerupActive.expiresAt - Date.now()) / 1000));
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.purple;
  ctx.fillText(`${State.powerupActive.type} ${seconds}s`, CONFIG.canvas.width / 2, 684);
}

/* === UTILITIES === */
function laneX(lane) {
  const margin = 140;
  const usable = CONFIG.canvas.width - margin * 2;
  return margin + lane * (usable / (CONFIG.spawn.laneCount - 1));
}

function speedMultiplier() {
  return 1 + (State.wave - 1) * 0.08;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

function weightedPick(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return entries[0][0];
}

function textNode(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

init();
