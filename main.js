const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const W = 360;
const H = 640;
const GROUND = 512;
const STORAGE_KEY = "pixel-volt-runner";

const dom = {
  home: document.querySelector("#home"),
  pause: document.querySelector("#pause"),
  help: document.querySelector("#help"),
  result: document.querySelector("#result"),
  hud: document.querySelector("#hud"),
  controls: document.querySelector("#controls"),
  homeCoins: document.querySelector("#homeCoins"),
  homeBest: document.querySelector("#homeBest"),
  scoreText: document.querySelector("#scoreText"),
  coinText: document.querySelector("#coinText"),
  energyFill: document.querySelector("#energyFill"),
  resultTitle: document.querySelector("#resultTitle"),
  resultDistance: document.querySelector("#resultDistance"),
  resultCoins: document.querySelector("#resultCoins"),
  resultCombo: document.querySelector("#resultCombo"),
  homeHint: document.querySelector("#homeHint"),
  startBtn: document.querySelector("#startBtn"),
  skinBtn: document.querySelector("#skinBtn"),
  helpBtn: document.querySelector("#helpBtn"),
  helpCloseBtn: document.querySelector("#helpCloseBtn"),
  pauseBtn: document.querySelector("#pauseBtn"),
  resumeBtn: document.querySelector("#resumeBtn"),
  quitBtn: document.querySelector("#quitBtn"),
  againBtn: document.querySelector("#againBtn"),
  homeBtn: document.querySelector("#homeBtn"),
  jumpBtn: document.querySelector("#jumpBtn"),
  slideBtn: document.querySelector("#slideBtn"),
  dashBtn: document.querySelector("#dashBtn"),
};

const save = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"coins":0,"best":0,"skin":0}');

const state = {
  mode: "home",
  time: 0,
  speed: 186,
  distance: 0,
  coins: 0,
  combo: 0,
  bestCombo: 0,
  energy: 0,
  dash: 0,
  magnet: 0,
  spawn: 0,
  coinSpawn: 0,
  segment: 0,
  shake: 0,
  player: {
    x: 82,
    y: GROUND - 56,
    w: 42,
    h: 54,
    vy: 0,
    onGround: true,
    sliding: false,
    slideTime: 0,
    invincible: 0,
  },
  coinsList: [],
  obstacles: [],
  powers: [],
  particles: [],
};

const lanes = {
  ground: GROUND - 82,
  hop: GROUND - 122,
  jump: GROUND - 156,
  slide: GROUND - 144,
};

const skins = [
  { body: "#ffd83d", cheek: "#ff665d", shadow: "#d29413" },
  { body: "#ffe678", cheek: "#ff7a79", shadow: "#caa84d" },
  { body: "#f5c62f", cheek: "#ff4a58", shadow: "#a66f13" },
];

const cloudPattern = [
  [0, 1, 1, 0, 0],
  [1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1],
];

function coinAt(x, y) {
  state.coinsList.push({ x, y, r: 9, taken: false });
}

function px(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function sprite(pattern, x, y, size, palette) {
  for (let row = 0; row < pattern.length; row += 1) {
    for (let col = 0; col < pattern[row].length; col += 1) {
      const key = pattern[row][col];
      if (key !== "." && palette[key]) {
        px(x + col * size, y + row * size, size, size, palette[key]);
      }
    }
  }
}

const mouseFrames = {
  runA: [
    "..kkkk....k....",
    ".kYYYYk..kYk...",
    ".kYYYYYkkYYk...",
    "..kYYYYYYYYk...",
    "..YYYYYYYYY....",
    ".YYKYYKYYRYY...",
    ".YYYYYYYYYYYk..",
    "..YYYYMYYYYkTT.",
    "...YYYYYYYkT...",
    "...YkYYYkYT....",
    "..YY...YYY.....",
    ".YY.....YY.....",
  ],
  runB: [
    "..kkkk...k.....",
    ".kYYYYk.kYk....",
    ".kYYYYYkYYk....",
    "..kYYYYYYYk....",
    "..YYYYYYYYY....",
    ".YYKYYKYYRYY...",
    ".YYYYYYYYYYYk..",
    "..YYYYMYYYYkTT.",
    "...YYYYYYYkT...",
    "..YYY..YkY.....",
    ".YY.....YYY....",
    "........YY.....",
  ],
  jump: [
    "...kkk...k.....",
    "..kYYYk.kYk....",
    ".kYYYYYkYYk....",
    ".kYYYYYYYYk....",
    ".YYYYYYYYY.....",
    "YYKYYKYYRYY....",
    "YYYYYYYYYYYkTT.",
    ".YYYYMYYYYkT...",
    "..YYYYYYYk.....",
    "..YkYYYkY......",
    ".YY...YY.......",
    "YY.....YY......",
  ],
  slide: [
    "................",
    "................",
    "...kkkk..k......",
    "..kYYYYkkYk.....",
    ".kYYYYYYYYk.....",
    "YYYYKYYKYYRYY...",
    "YYYYYYYYYYYYYkTT",
    ".YYYYMMYYYYYkT..",
    "..YYYYYYYYk.....",
    "...YY..YY.......",
  ],
  dash: [
    "..kkkk....k....",
    ".kYYYYk..kYk...",
    ".kYYYYYkkYYk...",
    "..kYYYYYYYYk...",
    "..YYYYYYYYY....",
    ".YYCYYCYYRYY...",
    ".YYYYYYYYYYYk..",
    "..YYYYMYYYYkTT.",
    "...YYYYYYYkT...",
    "..YY.YY.YY.....",
    ".YY...YY.......",
    "................",
  ],
};

const cuteMouseFrames = {
  runA: [
    "....KKK........K..",
    "...KYYKK......KYK.",
    "..KYYYYK.....KYYK.",
    "..KYYYYYK...KYYYK.",
    "...KYYYYYKKKYYYK..",
    "..KYYYYYYYYYYYYK..",
    ".KYYYYKYYKYYYYYK..",
    ".KYYYKKYYKKYRYYK..",
    ".KYYYYYYYYYYYYYKTT",
    "..KYYYYMYYYYYYKTT.",
    "...KYYYYYYYYYKTT..",
    "....KYYKYYKYYK....",
    "...KYYK..KYYYK....",
    "..KYYK....KYYK....",
  ],
  runB: [
    "....KKK.......K...",
    "...KYYKK.....KYK..",
    "..KYYYYK....KYYK..",
    "..KYYYYYK..KYYYK..",
    "...KYYYYYKKYYYK...",
    "..KYYYYYYYYYYYK...",
    ".KYYYYKYYKYYYYYK..",
    ".KYYYKKYYKKYRYYK..",
    ".KYYYYYYYYYYYYYKTT",
    "..KYYYYMYYYYYYKTT.",
    "...KYYYYYYYYYKTT..",
    "....KYYKYYKYYK....",
    "..KYYYK...KYYK....",
    "...KYYK....KYYYK..",
  ],
  jump: [
    "....KKK........K..",
    "...KYYKK......KYK.",
    "..KYYYYK.....KYYK.",
    "..KYYYYYK...KYYYK.",
    "...KYYYYYKKKYYYK..",
    "..KYYYYYYYYYYYYK..",
    ".KYYYYKYYKYYYYYK..",
    ".KYYYKKYYKKYRYYKTT",
    ".KYYYYYYYYYYYYYKTT",
    "..KYYYYMYYYYYYK...",
    "...KYYYYYYYYYK....",
    "..KYYK....KYYK....",
    ".KYYK......KYYK...",
    "KYYK........KYYK..",
  ],
  slide: [
    "..................",
    "..................",
    ".....KKK......K...",
    "....KYYKK....KYK..",
    "...KYYYYYKKKKYYK..",
    "..KYYYYYYYYYYYYK..",
    ".KYYYYKYYKYYYRYYK.",
    ".KYYYKKYYKKYYYYYTT",
    "..KYYYYMYYYYYYKTT.",
    "...KYYYYYYYYYK....",
    "....KYYK..KYYK....",
  ],
  dash: [
    "....KKK........K..",
    "...KYYKK......KYK.",
    "..KYYYYK.....KYYK.",
    "..KYYYYYK...KYYYK.",
    "...KYYYYYKKKYYYK..",
    "..KYYYYYYYYYYYYK..",
    ".KYYYYCYYCYYYYYK..",
    ".KYYYCCYYCCYRYYK..",
    ".KYYYYYYYYYYYYYKTT",
    "..KYYYYMYYYYYYKTT.",
    "...KYYYYYYYYYKTT..",
    "....KYYKYYKYYK....",
    "...KYYK..KYYYK....",
    "..KYYK....KYYK....",
  ],
};

function resizeCanvas() {
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

function setMode(mode) {
  state.mode = mode;
  dom.home.classList.toggle("hidden", mode !== "home");
  dom.help.classList.toggle("hidden", mode !== "help");
  dom.result.classList.toggle("hidden", mode !== "result");
  dom.pause.classList.toggle("hidden", mode !== "paused");
  dom.hud.classList.toggle("hidden", mode !== "playing");
  dom.controls.classList.toggle("hidden", mode !== "playing");
  updateHome();
}

function updateHome() {
  dom.homeCoins.textContent = save.coins;
  dom.homeBest.textContent = `${Math.floor(save.best)}m`;
}

function resetGame() {
  Object.assign(state, {
    mode: "playing",
    time: 0,
    speed: 186,
    distance: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    energy: 12,
    dash: 0,
    magnet: 0,
    spawn: 0.25,
    coinSpawn: 0,
    segment: 0,
    shake: 0,
    coinsList: [],
    obstacles: [],
    powers: [],
    particles: [],
  });
  Object.assign(state.player, {
    x: 82,
    y: GROUND - 56,
    w: 42,
    h: 54,
    vy: 0,
    onGround: true,
    sliding: false,
    slideTime: 0,
    invincible: 1.2,
  });
  setMode("playing");
}

function jump() {
  const p = state.player;
  if (state.mode !== "playing") return;
  if (p.onGround) {
    p.vy = -520;
    p.onGround = false;
    p.sliding = false;
    burst(p.x + 20, p.y + 50, "#fff06a", 8);
  }
}

function startSlide() {
  const p = state.player;
  if (state.mode !== "playing" || !p.onGround) return;
  p.sliding = true;
  p.slideTime = 0.48;
}

function dash() {
  if (state.mode !== "playing" || state.energy < 100) return;
  state.energy = 0;
  state.dash = 1.45;
  state.player.invincible = 1.45;
  burst(state.player.x + 38, state.player.y + 30, "#7cf7ff", 18);
}

function spawnObstacle() {
  const x = W + 30;
  const pattern = state.segment % 5;
  if (pattern === 1) {
    state.obstacles.push({ x, y: GROUND - 118, w: 42, h: 30, type: "drone", passed: false });
    spawnCoinLine(x - 92, lanes.ground, 4, 22);
    spawnCoinLine(x + 74, lanes.ground, 4, 22);
  } else if (pattern === 3) {
    state.obstacles.push({ x, y: GROUND - 42, w: 36, h: 38, type: "cone", passed: false });
    spawnCoinArc(x - 122, lanes.hop, 5, 24, 24);
  } else {
    state.obstacles.push({ x, y: GROUND - 42, w: 38, h: 38, type: "block", passed: false });
    spawnCoinLine(x + 72, lanes.ground, 5, 22);
  }
  state.segment += 1;
}

function spawnCoins() {
  const x = W + 22;
  if (state.segment % 4 === 0) {
    spawnCoinLine(x, lanes.ground, 6, 22);
  } else {
    spawnCoinArc(x, lanes.hop, 6, 24, 30);
  }
}

function spawnCoinLine(x, y, count, gap) {
  for (let i = 0; i < count; i += 1) coinAt(x + i * gap, y);
}

function spawnCoinArc(x, baseY, count, gap, lift) {
  for (let i = 0; i < count; i += 1) {
    const peak = Math.sin((i / (count - 1)) * Math.PI) * lift;
    coinAt(x + i * gap, baseY - peak);
  }
}

function spawnPower() {
  const y = Math.random() > 0.5 ? lanes.hop : lanes.ground;
  state.powers.push({
    x: W + 58,
    y,
    w: 24,
    h: 24,
    type: Math.random() > 0.5 ? "bolt" : "magnet",
  });
}

function update(dt) {
  state.time += dt;
  if (state.mode !== "playing") return;

  const p = state.player;
  const speedBoost = state.dash > 0 ? 1.85 : 1;
  const speed = state.speed * speedBoost;
  state.speed = Math.min(330, state.speed + dt * 3.6);
  state.distance += speed * dt * 0.06;
  state.energy = Math.min(100, state.energy + dt * 7.5);
  state.dash = Math.max(0, state.dash - dt);
  state.magnet = Math.max(0, state.magnet - dt);
  state.shake = Math.max(0, state.shake - dt);
  p.invincible = Math.max(0, p.invincible - dt);

  if (p.sliding) {
    p.slideTime -= dt;
    if (p.slideTime <= 0) p.sliding = false;
  }

  p.vy += 1160 * dt;
  p.y += p.vy * dt;
  const targetY = GROUND - (p.sliding ? 36 : 56);
  if (p.y >= targetY) {
    p.y = targetY;
    p.vy = 0;
    p.onGround = true;
  }

  state.spawn -= dt;
  state.coinSpawn -= dt;
  if (state.spawn <= 0) {
    spawnObstacle();
    if (Math.random() > 0.72) spawnPower();
    state.spawn = Math.max(1.05, 1.72 - state.distance / 1200) + Math.random() * 0.34;
  }
  if (state.coinSpawn <= 0) {
    const clearPath = !state.obstacles.some((obs) => obs.x > W - 40 && obs.x < W + 190);
    if (clearPath) {
      spawnCoins();
      state.coinSpawn = 1.65 + Math.random() * 0.85;
    } else {
      state.coinSpawn = 0.35;
    }
  }

  moveAndCull(state.obstacles, speed, dt);
  moveAndCull(state.coinsList, speed, dt);
  moveAndCull(state.powers, speed, dt);
  updateParticles(dt);
  collectItems();
  checkCollisions();
  updateHud();
}

function moveAndCull(list, speed, dt) {
  for (const item of list) item.x -= speed * dt;
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (list[i].x < -80 || list[i].taken) list.splice(i, 1);
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function playerBox() {
  const p = state.player;
  return {
    x: p.x + 7,
    y: p.y + (p.sliding ? 9 : 4),
    w: p.w - 12,
    h: p.sliding ? 26 : p.h - 8,
  };
}

function collectItems() {
  const box = playerBox();
  for (const coin of state.coinsList) {
    if (state.magnet > 0) {
      const dx = state.player.x + 18 - coin.x;
      const dy = state.player.y + 20 - coin.y;
      if (Math.hypot(dx, dy) < 118) {
        coin.x += dx * 0.12;
        coin.y += dy * 0.12;
      }
    }
    if (rectsOverlap(box, { x: coin.x - 8, y: coin.y - 8, w: 16, h: 16 })) {
      coin.taken = true;
      state.coins += 1;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.energy = Math.min(100, state.energy + 3);
      burst(coin.x, coin.y, "#ffdf42", 6);
    }
  }

  for (const power of state.powers) {
    if (rectsOverlap(box, power)) {
      power.taken = true;
      if (power.type === "bolt") state.energy = 100;
      if (power.type === "magnet") state.magnet = 6;
      burst(power.x, power.y, power.type === "bolt" ? "#7cf7ff" : "#ff6cff", 12);
    }
  }
}

function checkCollisions() {
  const box = playerBox();
  for (const obs of state.obstacles) {
    if (!obs.passed && obs.x + obs.w < state.player.x) {
      obs.passed = true;
      state.combo += 2;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
    }
    if (rectsOverlap(box, obs)) {
      if (state.player.invincible > 0 || state.dash > 0) {
        obs.taken = true;
        burst(obs.x + obs.w / 2, obs.y + obs.h / 2, "#7cf7ff", 14);
      } else {
        gameOver();
        return;
      }
    }
  }
}

function gameOver() {
  state.mode = "result";
  const isNewBest = Math.floor(state.distance) > save.best;
  save.coins += state.coins;
  save.best = Math.max(save.best, Math.floor(state.distance));
  persist();
  dom.resultTitle.textContent = isNewBest ? "新的电力记录" : "本局结算";
  dom.resultDistance.textContent = `${Math.floor(state.distance)}m`;
  dom.resultCoins.textContent = state.coins;
  dom.resultCombo.textContent = state.bestCombo;
  setMode("result");
}

function updateHud() {
  dom.scoreText.textContent = `${Math.floor(state.distance)}m`;
  dom.coinText.textContent = state.coins;
  dom.energyFill.style.width = `${state.energy}%`;
  dom.dashBtn.style.opacity = state.energy >= 100 ? "1" : "0.58";
}

function burst(x, y, color, amount) {
  for (let i = 0; i < amount; i += 1) {
    state.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 150,
      vy: (Math.random() - 0.7) * 150,
      life: 0.35 + Math.random() * 0.35,
      color,
    });
  }
}

function updateParticles(dt) {
  for (const part of state.particles) {
    part.life -= dt;
    part.x += part.vx * dt;
    part.y += part.vy * dt;
    part.vy += 260 * dt;
  }
  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    if (state.particles[i].life <= 0) state.particles.splice(i, 1);
  }
}

function draw() {
  ctx.save();
  if (state.shake > 0) ctx.translate((Math.random() - 0.5) * 5, 0);
  drawWorld();
  if (state.mode !== "home") {
    drawItems();
    drawPlayer();
    drawParticles();
  } else {
    drawAttract();
  }
  ctx.restore();
}

function drawWorld() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#1a2a55");
  sky.addColorStop(0.52, "#3d69a5");
  sky.addColorStop(1, "#79d270");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const parallax = state.time * (state.mode === "playing" ? state.speed : 28);
  drawClouds(parallax * 0.12);
  drawCity(parallax * 0.22);
  drawGround(parallax);
}

function drawClouds(offset) {
  for (let i = 0; i < 5; i += 1) {
    const x = ((i * 112 - offset) % 520) - 80;
    const y = 70 + (i % 3) * 28;
    sprite(cloudPattern, x, y, 8, { 1: "rgba(255,255,255,0.72)" });
  }
}

function drawCity(offset) {
  for (let i = 0; i < 8; i += 1) {
    const x = ((i * 64 - offset) % 560) - 90;
    const h = 58 + (i % 4) * 18;
    px(x, GROUND - 84 - h, 44, h, i % 2 ? "#2a4171" : "#203662");
    for (let y = GROUND - 74 - h; y < GROUND - 94; y += 16) {
      px(x + 9, y, 8, 6, "#ffd65b");
      px(x + 28, y + 3, 8, 6, "#7cf7ff");
    }
  }
}

function drawGround(offset) {
  px(0, GROUND, W, 128, "#5dd35e");
  px(0, GROUND + 18, W, 110, "#b96d34");
  for (let x = -32 - (offset % 32); x < W + 32; x += 32) {
    px(x, GROUND, 18, 8, "#a4f06a");
    px(x + 12, GROUND + 28, 16, 8, "#7a431d");
    px(x + 4, GROUND + 62, 24, 8, "#8c512a");
  }
  px(0, GROUND - 4, W, 4, "#fff06a");
}

function drawAttract() {
  for (let i = 0; i < 8; i += 1) {
    drawCoin(40 + i * 38, 322 + Math.sin(state.time * 3 + i) * 8);
  }
  drawObstacle({ x: 260, y: GROUND - 38, w: 34, h: 34, type: "block" });
}

function drawItems() {
  for (const coin of state.coinsList) drawCoin(coin.x, coin.y);
  for (const power of state.powers) drawPower(power);
  for (const obs of state.obstacles) drawObstacle(obs);
}

function drawCoin(x, y) {
  const shine = Math.floor(state.time * 8) % 2;
  px(x - 8, y - 8, 16, 16, "#8b5600");
  px(x - 10, y - 6, 20, 12, "#ffb629");
  px(x - 8, y - 10, 16, 20, "#ffcf37");
  px(x - 4, y - 6, 8, 12, "#fff06a");
  px(x - 1, y - 7, 3, 14, "#b66e00");
  if (shine) px(x - 6, y - 6, 4, 4, "#fff9b2");
}

function drawPower(power) {
  if (power.type === "bolt") {
    px(power.x + 9, power.y - 2, 10, 8, "#fff9a8");
    px(power.x + 5, power.y + 6, 14, 8, "#ffdf42");
    px(power.x + 12, power.y + 14, 9, 8, "#7cf7ff");
    px(power.x + 4, power.y + 22, 10, 8, "#ffdf42");
    px(power.x + 15, power.y + 8, 5, 5, "#fff");
  } else {
    px(power.x + 2, power.y + 2, 8, 18, "#db3bce");
    px(power.x + 16, power.y + 2, 8, 18, "#db3bce");
    px(power.x + 2, power.y + 16, 22, 8, "#f6f6ff");
    px(power.x + 6, power.y + 20, 14, 5, "#ff65d8");
  }
}

function drawObstacle(obs) {
  if (obs.type === "drone") {
    px(obs.x + 3, obs.y + 12, obs.w - 6, 18, "#4b556d");
    px(obs.x + 11, obs.y + 5, 20, 10, "#ff5a4d");
    px(obs.x + 14, obs.y + 17, 5, 5, "#161923");
    px(obs.x + 24, obs.y + 17, 5, 5, "#161923");
    px(obs.x - 8, obs.y + 15, 10, 6, "#7cf7ff");
    px(obs.x + obs.w - 2, obs.y + 15, 10, 6, "#7cf7ff");
    px(obs.x + 7, obs.y + 30, 5, 6, "#2b3143");
    px(obs.x + obs.w - 12, obs.y + 30, 5, 6, "#2b3143");
    return;
  }
  if (obs.type === "cone") {
    px(obs.x + 14, obs.y, 10, 8, "#fff0a0");
    px(obs.x + 10, obs.y + 8, 18, 10, "#ff6a3d");
    px(obs.x + 6, obs.y + 18, 26, 12, "#fff0a0");
    px(obs.x + 2, obs.y + 30, 34, 8, "#ff6a3d");
    px(obs.x, obs.y + 38, 38, 5, "#5b2a13");
    return;
  }
  px(obs.x, obs.y, obs.w, obs.h, "#7b4a2d");
  px(obs.x + 4, obs.y + 4, obs.w - 8, 8, "#c87336");
  px(obs.x + 5, obs.y + 14, obs.w - 10, 5, "#fff06a");
  px(obs.x + 8, obs.y + 24, 8, 8, "#3b1d14");
  px(obs.x + 23, obs.y + 24, 8, 8, "#3b1d14");
}

function drawPlayer() {
  const p = state.player;
  const skin = skins[save.skin % skins.length];
  let frame = Math.floor(state.time * 12) % 2 ? cuteMouseFrames.runA : cuteMouseFrames.runB;
  if (!p.onGround) frame = cuteMouseFrames.jump;
  if (p.sliding) frame = cuteMouseFrames.slide;
  if (state.dash > 0) frame = cuteMouseFrames.dash;

  if (state.dash > 0) {
    for (let i = 0; i < 5; i += 1) {
      px(p.x - 28 - i * 12, p.y + 18 + (i % 2) * 7, 26, 5, i % 2 ? "#fff45f" : "#7cf7ff");
    }
  }

  sprite(frame, p.x - 12, p.y - 5, 4, {
    Y: skin.body,
    R: skin.cheek,
    K: "#1d1b22",
    M: "#5f3200",
    T: skin.shadow,
    C: "#7cf7ff",
    k: "#3b2600",
  });
}

function drawParticles() {
  for (const part of state.particles) {
    px(part.x, part.y, 4, 4, part.color);
  }
}

function bindPress(button, down, up) {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);
    button.classList.add("is-pressed");
    down();
  });
  if (up) {
    const release = (event) => {
      event.preventDefault();
      button.classList.remove("is-pressed");
      up();
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  } else {
    button.addEventListener("pointerup", () => button.classList.remove("is-pressed"));
    button.addEventListener("pointercancel", () => button.classList.remove("is-pressed"));
  }
}

dom.startBtn.addEventListener("click", resetGame);
dom.againBtn.addEventListener("click", resetGame);
dom.homeBtn.addEventListener("click", () => setMode("home"));
dom.pauseBtn.addEventListener("click", () => setMode("paused"));
dom.resumeBtn.addEventListener("click", () => setMode("playing"));
dom.quitBtn.addEventListener("click", () => setMode("home"));
dom.helpBtn.addEventListener("click", () => setMode("help"));
dom.helpCloseBtn.addEventListener("click", () => setMode("home"));

bindPress(dom.jumpBtn, jump);
bindPress(dom.slideBtn, startSlide, () => {
  state.player.sliding = false;
});
bindPress(dom.dashBtn, dash);

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  if (state.mode === "playing") jump();
});
canvas.addEventListener("contextmenu", (event) => event.preventDefault());
document.addEventListener("selectstart", (event) => event.preventDefault());
document.addEventListener("gesturestart", (event) => event.preventDefault());

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") jump();
  if (event.code === "ArrowDown") startSlide();
  if (event.code === "KeyX" || event.code === "ShiftLeft") dash();
  if (event.code === "Escape" && state.mode === "playing") setMode("paused");
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ArrowDown") state.player.sliding = false;
});

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
setMode("home");
requestAnimationFrame(loop);
