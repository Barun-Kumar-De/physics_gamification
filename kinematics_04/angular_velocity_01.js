/* ================================================================
   Angular Velocity — Interactive Module  (app.js)
   ================================================================ */

const SCREEN_TITLES = [
  '', // position 0 unused
  'Angular Displacement',
  'Angular Velocity',
  'Direction (RHR)',
  'v = rω',
  'Multi-Representations',
  'MCQ #1',
  'MCQ #2',
];
const SCREENS = [1, 2, 3, 4, 6, 7, 8]; // screen section IDs in order (s5 removed)

let currentScreen = 1;

// ─── Voice Narration ─────────────────────────────────────────────
let voiceEnabled = localStorage.getItem('angVelVoice') !== 'false';

// Browsers block speechSynthesis.speak() until the page has a user gesture,
// so the first narration on page load is silently dropped. We defer it until
// the first pointer/key/touch interaction primes the speech engine.
let speechPrimed = false;

function primeSpeech() {
  if (speechPrimed) return;
  speechPrimed = true;
  narrate(NARRATIONS[currentScreen]);
}

const NARRATIONS = {
  1: "Angular Displacement. Angular displacement is the angle rotated by a body about a fixed axis. It is measured in radians or degrees. Drag the radius on the canvas to explore. Watch how the arc length changes with the angle. Watch the values of angles both in radian and degree",
  2: "Angular Velocity. Angular velocity, omega, is the rate of change of angular displacement with time. Average omega equals delta theta divided by delta t. Use the sliders to change delta theta and delta t and observe how omega changes.",
  3: "Direction of Angular Velocity. Angular velocity is a vector. Its direction is given by the Right Hand Rule: curl your right-hand fingers in the direction of rotation, and your extended thumb points along the axis — giving the direction of the angular velocity vector.",
  4: "The v equals r omega relationship. The linear velocity of a point on a rotating body equals r times omega, where r is its distance from the axis. Points farther from the axis move faster, even though all points share the same angular velocity.",
  6: "Multiple Representations. A rotating disc can be described with position-time and velocity-time graphs. Study the animation, then match it to the correct theta-t and omega-t graphs in the challenges below.",
  7: "JEE Main Question 1. A particle moves in a circle of radius 0.5 metres at 30 revolutions per minute. What is its linear speed in metres per second? Choose the correct option.",
  8: "JEE Main Question 2. The angular position of a particle is given by theta equals 2t cubed minus 3t squared plus 4 radians. Find the angular velocity at t equals 2 seconds. Choose the correct option.",
};

const MCQ_FEEDBACK = {
  s7: {
    correct: "Correct! The angular velocity is 30 r.p.m. equals pi radians per second. Linear speed v equals r omega equals 0.5 times pi, which is approximately 1.57 metres per second.",
    wrong:   "Not quite. Convert 30 r.p.m. to radians per second: omega equals 2 pi times 30 divided by 60 equals pi rad per second. Then v equals r omega equals 0.5 times pi, approximately 1.57 metres per second. Option B is correct.",
  },
  s8: {
    correct: "Correct! Differentiating theta equals 2t cubed minus 3t squared plus 4 gives omega equals 6t squared minus 6t. At t equals 2: omega equals 6 times 4 minus 12 equals 12 radians per second.",
    wrong:   "Not quite. Differentiate theta equals 2t cubed minus 3t squared plus 4 to get omega equals 6t squared minus 6t. Substituting t equals 2: omega equals 24 minus 12 equals 12 radians per second. Option C is correct.",
  },
};

function narrate(text) {
  if (!voiceEnabled) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.92;
  utt.pitch = 1.0;
  window.speechSynthesis.speak(utt);
}

function stopNarration() {
  window.speechSynthesis.cancel();
}

function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  localStorage.setItem('angVelVoice', voiceEnabled);
  const btn = document.getElementById('voiceBtn');
  btn.textContent = voiceEnabled ? '🔊' : '🔇';
  btn.title = voiceEnabled ? 'Mute narration' : 'Unmute narration';
  btn.classList.toggle('muted', !voiceEnabled);
  if (!voiceEnabled) stopNarration();
  else narrate(NARRATIONS[currentScreen]);
}

// ─── Navigation ──────────────────────────────────────────────────
function goTo(n) {
  document.querySelector('.screen.active').classList.remove('active');
  document.getElementById('s' + n).classList.add('active');
  currentScreen = n;
  updateHeader();
  updateDots();
  screenInit(n);
}

function updateHeader() {
  const pos = SCREENS.indexOf(currentScreen) + 1;
  const total = SCREENS.length;
  document.getElementById('headerLabel').textContent = `Screen ${pos} of ${total}`;
  document.getElementById('footerLabel').textContent =
    `Screen ${pos} of ${total} · Angular Velocity · JEE Main / NEET`;
}

function updateDots() {
  const container = document.getElementById('progressDots');
  container.innerHTML = '';
  const curIdx = SCREENS.indexOf(currentScreen);
  SCREENS.forEach((id, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (id === currentScreen ? ' active' : i < curIdx ? ' done' : '');
    d.title = SCREEN_TITLES[i + 1] || '';
    d.onclick = () => goTo(id);
    container.appendChild(d);
  });
}

function screenInit(n) {
  const inits = { 1: s1Init, 2: s2Init, 3: s3Init, 4: s4Init,
                  6: s6Init, 7: s7Init, 8: s8Init };
  if (inits[n]) inits[n]();
}

// ─── Helpers ─────────────────────────────────────────────────────
function raf(fn) { return requestAnimationFrame(fn); }

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawCircle(ctx, cx, cy, r, style = {}) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = style.stroke || '#1a2332';
  ctx.lineWidth = style.lw || 2;
  ctx.stroke();
  if (style.fill) { ctx.fillStyle = style.fill; ctx.fill(); }
}

function drawLine(ctx, x1, y1, x2, y2, style = {}) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = style.color || '#1a2332';
  ctx.lineWidth = style.lw || 2;
  if (style.dash) ctx.setLineDash(style.dash); else ctx.setLineDash([]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawArrow(ctx, x1, y1, x2, y2, color = '#3b6fd4', lw = 2, hs = 10) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  drawLine(ctx, x1, y1, x2, y2, { color, lw });
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hs * Math.cos(angle - Math.PI / 6), y2 - hs * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - hs * Math.cos(angle + Math.PI / 6), y2 - hs * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawText(ctx, text, x, y, style = {}) {
  ctx.font = (style.weight || '') + ' ' + (style.size || '13px') + ' Segoe UI, sans-serif';
  ctx.fillStyle = style.color || '#1a2332';
  ctx.textAlign = style.align || 'center';
  ctx.textBaseline = style.baseline || 'middle';
  ctx.fillText(text, x, y);
}

function drawArc(ctx, cx, cy, r, start, end, color = '#3b6fd4', lw = 2, ccw = false) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, start, end, ccw);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.stroke();
}

// ================================================================
// SCREEN 01 — Angular Displacement
// ================================================================
const S1 = {
  angle: 0.92,    // current angle in rad
  unit: 'rad',
  dragging: false,
  animId: null,
};

const SNAP_ANGLES = [
  Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2,
  2 * Math.PI / 3, 3 * Math.PI / 4, 5 * Math.PI / 6, Math.PI,
  4 * Math.PI / 3, 3 * Math.PI / 2, 2 * Math.PI,
];
const SNAP_THRESHOLD = 0.12;

function s1Init() {
  const c = document.getElementById('c1');
  s1Draw();
  s1UpdateReadout();
  c.onmousedown  = s1MouseDown;
  c.onmousemove  = s1MouseMove;
  c.onmouseup    = s1MouseUp;
  c.onmouseleave = s1MouseUp;
  c.ontouchstart = e => { e.preventDefault(); s1MouseDown(e.touches[0]); };
  c.ontouchmove  = e => { e.preventDefault(); s1MouseMove(e.touches[0]); };
  c.ontouchend   = s1MouseUp;
  // Only narrate here if speech is already primed (i.e. after a gesture).
  // On initial load, primeSpeech() handles the first narration.
  if (speechPrimed) narrate(NARRATIONS[1]);
}

function s1GetAngle(e) {
  const c = document.getElementById('c1');
  const rect = c.getBoundingClientRect();
  const cx = c.width / 2, cy = c.height / 2;
  const mx = (e.clientX - rect.left) * (c.width / rect.width)  - cx;
  const my = (e.clientY - rect.top)  * (c.height / rect.height) - cy;
  return Math.atan2(my, mx);
}

function s1MouseDown(e) {
  S1.dragging = true;
  S1.angle = s1GetAngle(e);
  s1SnapAndUpdate();
}
function s1MouseMove(e) {
  if (!S1.dragging) return;
  S1.angle = s1GetAngle(e);
  s1SnapAndUpdate();
}
function s1MouseUp() { S1.dragging = false; }

function s1SnapAndUpdate() {
  let a = S1.angle;
  if (a < 0) a += 2 * Math.PI;
  for (const snap of SNAP_ANGLES) {
    if (Math.abs(a - snap) < SNAP_THRESHOLD) { a = snap; break; }
  }
  S1.angle = a;
  s1Draw();
  s1UpdateReadout();
}

function s1Draw() {
  const c = document.getElementById('c1');
  const ctx = c.getContext('2d');
  clearCanvas(ctx);
  const cx = c.width / 2, cy = c.height / 2, R = Math.min(cx, cy) - 30;

  // Reference line (dashed)
  drawLine(ctx, cx, cy, cx + R, cy, { color: '#aab8cc', lw: 1.5, dash: [6, 4] });

  // Arc
  const angle = S1.angle;
  if (angle > 0.02) {
    drawArc(ctx, cx, cy, R * 0.45, 0, angle, '#3b6fd4', 2.5);
    // θ label at arc midpoint
    const ma = angle / 2;
    drawText(ctx, 'θ', cx + R * 0.52 * Math.cos(ma), cy + R * 0.52 * Math.sin(ma),
      { color: '#3b6fd4', size: '18px', weight: 'bold' });
  }

  // Circle
  drawCircle(ctx, cx, cy, R, { lw: 2 });

  // Radius line
  const ex = cx + R * Math.cos(angle);
  const ey = cy + R * Math.sin(angle);
  drawLine(ctx, cx, cy, ex, ey, { color: '#3b6fd4', lw: 3 });

  // Center dot
  drawCircle(ctx, cx, cy, 6, { fill: '#1a2332', stroke: '#1a2332' });

  // End dot (draggable)
  drawCircle(ctx, ex, ey, 9, { fill: '#3b6fd4', stroke: '#3b6fd4' });

  // Arc length annotation
  if (angle > 0.1) {
    const arcX = cx + (R + 18) * Math.cos(angle / 2);
    const arcY = cy + (R + 18) * Math.sin(angle / 2);
    drawText(ctx, 's', arcX, arcY, { color: '#3b6fd4', size: '13px' });
  }
}

function s1UpdateReadout() {
  let a = S1.angle;
  if (a < 0) a += 2 * Math.PI;
  document.getElementById('s1-rad-chip').textContent = `θ = ${a.toFixed(2)} rad`;
  document.getElementById('s1-deg-chip').textContent = `θ = ${(a * 180 / Math.PI).toFixed(1)}°`;
  const degInput = document.getElementById('c1-deg-input');
  const radInput = document.getElementById('c1-rad-input');
  if (degInput) degInput.value = (a * 180 / Math.PI).toFixed(1);
  if (radInput) radInput.value = a.toFixed(3);
}

function s1SetUnit(u) {
  S1.unit = u;
  document.getElementById('s1-unit-rad').classList.toggle('active', u === 'rad');
  document.getElementById('s1-unit-deg').classList.toggle('active', u === 'deg');
}

function s1Reset() {
  S1.angle = 0;
  s1Draw();
  s1UpdateReadout();
}

function s1ConverterFromDeg() {
  const d = parseFloat(document.getElementById('c1-deg-input').value) || 0;
  document.getElementById('c1-rad-input').value = (d * Math.PI / 180).toFixed(4);
}
function s1ConverterFromRad() {
  const r = parseFloat(document.getElementById('c1-rad-input').value) || 0;
  document.getElementById('c1-deg-input').value = (r * 180 / Math.PI).toFixed(2);
}
function s1SwapConverter() {
  const d = document.getElementById('c1-deg-input').value;
  const r = document.getElementById('c1-rad-input').value;
  document.getElementById('c1-deg-input').value = r;
  document.getElementById('c1-rad-input').value = d;
}

// ================================================================
// SCREEN 02 — Angular Velocity
// ================================================================
const S2 = {
  dtheta: 1.57,
  dt: 0.5,
  mode: 'const',
  unit: 'rad',
  angle: 0,
  animId: null,
  lastTime: null,
  varOmega: 1.0,
  varDir: 1,
  narrationTimeout: null,
};

function s2Init() {
  S2.lastTime = null;
  s2Update();

  const box   = document.getElementById('s2-controls-box');
  const units = document.getElementById('s2-units-section');
  if (box)   box.classList.remove('narration-highlight');
  if (units) units.classList.remove('narration-highlight');
  if (S2.narrationTimeout) { clearTimeout(S2.narrationTimeout); S2.narrationTimeout = null; }

  if (!voiceEnabled) return;
  window.speechSynthesis.cancel();

  const part1 = new SpeechSynthesisUtterance(
    "Angular Velocity. Angular velocity, omega, is the rate of change of angular displacement with time. Average omega equals delta theta divided by delta t."
  );
  part1.rate = 0.92; part1.pitch = 1.0;

  part1.onend = () => {
    S2.narrationTimeout = setTimeout(() => {
      S2.narrationTimeout = null;

      const part2 = new SpeechSynthesisUtterance(
        "You can view the angular velocity in radians per second, revolutions per minute, or degrees per second. Use the unit buttons to switch between them."
      );
      part2.rate = 0.92; part2.pitch = 1.0;
      if (units) units.classList.add('narration-highlight');
      part2.onend = () => {
        if (units) units.classList.remove('narration-highlight');

        const part3 = new SpeechSynthesisUtterance(
          "Use the sliders to change delta theta and delta t and observe how omega changes."
        );
        part3.rate = 0.92; part3.pitch = 1.0;
        if (box) box.classList.add('narration-highlight');
        part3.onend = () => { if (box) box.classList.remove('narration-highlight'); };
        window.speechSynthesis.speak(part3);
      };
      window.speechSynthesis.speak(part2);
    }, 2000);
  };

  window.speechSynthesis.speak(part1);
}

function s2Update() {
  S2.dtheta = parseFloat(document.getElementById('s2-sl-dtheta').value);
  S2.dt = parseFloat(document.getElementById('s2-sl-dt').value);
  const omega = S2.dtheta / S2.dt;
  document.getElementById('s2-sl-dtheta-val').textContent = `current: ${S2.dtheta.toFixed(2)} rad`;
  document.getElementById('s2-sl-dt-val').textContent     = `current: ${S2.dt.toFixed(2)} s`;
  document.getElementById('s2-dtheta').textContent = `${S2.dtheta.toFixed(2)} rad`;
  document.getElementById('s2-dt').textContent     = `${S2.dt.toFixed(2)} s`;
  let omegaDisplay, convText = '';
  if (S2.unit === 'rpm') {
    const rpm = omega * 60 / (2 * Math.PI);
    omegaDisplay = `${rpm.toFixed(2)} rev/min`;
    convText = `${omega.toFixed(3)} rad/s × 60/(2π) = ${rpm.toFixed(2)} rev/min`;
  } else if (S2.unit === 'degs') {
    const degs = omega * 180 / Math.PI;
    omegaDisplay = `${degs.toFixed(2)} deg/s`;
    convText = `${omega.toFixed(3)} rad/s × 180/π = ${degs.toFixed(2)} deg/s`;
  } else {
    omegaDisplay = `${omega.toFixed(2)} rad/s`;
  }
  document.getElementById('s2-omega').textContent = omegaDisplay;
  const convEl = document.getElementById('s2-conversion');
  if (convEl) convEl.textContent = convText;
  if (!S2.animId) s2Animate();
}

function s2SetUnit(u) {
  S2.unit = u;
  document.getElementById('s2-unit-rad').classList.toggle('active', u === 'rad');
  document.getElementById('s2-unit-rpm').classList.toggle('active', u === 'rpm');
  document.getElementById('s2-unit-degs').classList.toggle('active', u === 'degs');
  s2Update();
}

function s2Animate() {
  if (S2.animId) cancelAnimationFrame(S2.animId);
  function loop(ts) {
    if (!S2.lastTime) S2.lastTime = ts;
    const dt = (ts - S2.lastTime) / 1000;
    S2.lastTime = ts;
    let omega;
    if (S2.mode === 'const') {
      omega = S2.dtheta / S2.dt;
    } else {
      S2.varOmega += S2.varDir * 0.5 * dt;
      if (S2.varOmega > 8) S2.varDir = -1;
      if (S2.varOmega < 0.5) S2.varDir = 1;
      omega = S2.varOmega;
    }
    S2.angle += omega * dt;
    s2Draw(omega);
    S2.animId = requestAnimationFrame(loop);
  }
  S2.animId = requestAnimationFrame(loop);
}

function s2Draw(omega) {
  const c = document.getElementById('c2');
  if (!c) return;
  const ctx = c.getContext('2d');
  clearCanvas(ctx);
  const cx = c.width / 2, cy = c.height / 2, R = Math.min(cx, cy) - 25;
  drawCircle(ctx, cx, cy, R, { lw: 2 });
  const angle = S2.angle % (2 * Math.PI);
  const px = cx + R * Math.cos(angle), py = cy + R * Math.sin(angle);

  // Sweep arc
  drawArc(ctx, cx, cy, R, 0, angle, '#3b6fd490', 3);

  // Radius
  drawLine(ctx, cx, cy, px, py, { color: '#3b6fd4', lw: 2.5 });

  // Particle dot
  drawCircle(ctx, px, py, 10, { fill: '#3b6fd4', stroke: '#3b6fd4' });

  // Angular velocity arc arrow at top
  const arrowR = R * 0.28;
  drawArc(ctx, cx, cy, arrowR, -Math.PI / 2, -Math.PI / 2 + 1.8, '#3b6fd4', 2.5);
  const ae = -Math.PI / 2 + 1.8;
  const tx = cx + arrowR * Math.cos(ae), ty = cy + arrowR * Math.sin(ae);
  const tang = ae + Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - 8 * Math.cos(tang - 0.4), ty - 8 * Math.sin(tang - 0.4));
  ctx.lineTo(tx - 8 * Math.cos(tang + 0.4), ty - 8 * Math.sin(tang + 0.4));
  ctx.closePath(); ctx.fillStyle = '#3b6fd4'; ctx.fill();

  // Center
  drawCircle(ctx, cx, cy, 5, { fill: '#1a2332', stroke: '#1a2332' });

  // Live omega update for variable mode
  if (S2.mode === 'var') {
    document.getElementById('s2-omega').textContent = `${omega.toFixed(2)} rad/s`;
  }
}

// ================================================================
// SCREEN 03 — Direction of Angular Velocity
// ================================================================
const S3 = {
  dir: 'acw',
  view: '2d',
  angle: 0,
  animId: null,
  narrationTimeout: null,
};

function s3Init() {
  if (S3.animId) cancelAnimationFrame(S3.animId);
  S3.animId = null;
  s3DrawRHRBoth();
  s3Animate();

  const view = document.getElementById('s3-view-box');
  if (view) view.classList.remove('narration-highlight');
  if (S3.narrationTimeout) { clearTimeout(S3.narrationTimeout); S3.narrationTimeout = null; }

  if (!voiceEnabled) return;
  window.speechSynthesis.cancel();

  const part1 = new SpeechSynthesisUtterance(NARRATIONS[3]);
  part1.rate = 0.92; part1.pitch = 1.0;

  part1.onend = () => {
    S3.narrationTimeout = setTimeout(() => {
      S3.narrationTimeout = null;
      const part2 = new SpeechSynthesisUtterance(
        "You can view the rotation in 2D top view or 3D perspective. Use the View buttons to switch between them."
      );
      part2.rate = 0.92; part2.pitch = 1.0;
      if (view) view.classList.add('narration-highlight');
      part2.onend = () => { if (view) view.classList.remove('narration-highlight'); };
      window.speechSynthesis.speak(part2);
    }, 2000);
  };

  window.speechSynthesis.speak(part1);
}

function s3SetDir(d) {
  S3.dir = d;
  document.getElementById('s3-acw-btn').classList.toggle('active', d === 'acw');
  document.getElementById('s3-cw-btn').classList.toggle('active', d === 'cw');
  const out = d === 'acw';
  document.getElementById('s3-omega-label').textContent = out
    ? 'ω⃗ (out of screen) — Anticlockwise'
    : 'ω⃗ (into screen) — Clockwise';
}

function s3SetView(v) {
  S3.view = v;
  ['2d', '3d'].forEach(x => {
    document.getElementById('s3-v' + x).classList.toggle('active', v === x);
  });
}

function s3Animate() {
  function loop() {
    const sign = S3.dir === 'acw' ? -1 : 1;
    S3.angle += sign * 0.025;
    s3Draw();
    S3.animId = requestAnimationFrame(loop);
  }
  S3.animId = requestAnimationFrame(loop);
}

function s3Draw() {
  const c = document.getElementById('c3');
  if (!c) return;
  const ctx = c.getContext('2d');
  clearCanvas(ctx);
  const cx = c.width / 2, cy = c.height / 2 + 10, R = Math.min(cx, cy) - 25;

  if (S3.view === '3d') {
    s3Draw3D(ctx, cx, cy, R);
    return;
  }

  // 2D top view
  drawCircle(ctx, cx, cy, R, { lw: 2 });
  const angle = S3.angle;
  const px = cx + R * Math.cos(angle), py = cy + R * Math.sin(angle);
  drawLine(ctx, cx, cy, px, py, { color: '#3b6fd4', lw: 2.5 });
  drawCircle(ctx, px, py, 9, { fill: '#3b6fd4', stroke: '#3b6fd4' });

  // Center vector symbol
  const isACW = S3.dir === 'acw';
  if (isACW) {
    // ⊙ out of screen
    drawCircle(ctx, cx, cy, 18, { lw: 2, stroke: '#3b6fd4' });
    drawCircle(ctx, cx, cy, 5,  { fill: '#3b6fd4', stroke: '#3b6fd4' });
  } else {
    // ⊗ into screen
    drawCircle(ctx, cx, cy, 18, { lw: 2, stroke: '#e53935' });
    drawLine(ctx, cx - 12, cy - 12, cx + 12, cy + 12, { color: '#e53935', lw: 2 });
    drawLine(ctx, cx + 12, cy - 12, cx - 12, cy + 12, { color: '#e53935', lw: 2 });
  }

  // Rotation direction arrow arc
  const arcR = R * 0.7;
  const arcStart = angle + 0.2;
  const arcEnd   = angle + (isACW ? 1.2 : -1.2);
  drawArc(ctx, cx, cy, arcR, arcStart, arcEnd, '#3b6fd4', 2, !isACW);
  // Arrowhead at end of arc
  const ae = arcEnd;
  const tx = cx + arcR * Math.cos(ae), ty = cy + arcR * Math.sin(ae);
  const tang = ae + (isACW ? Math.PI / 2 : -Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - 9 * Math.cos(tang - 0.4), ty - 9 * Math.sin(tang - 0.4));
  ctx.lineTo(tx - 9 * Math.cos(tang + 0.4), ty - 9 * Math.sin(tang + 0.4));
  ctx.closePath(); ctx.fillStyle = '#3b6fd4'; ctx.fill();
}

function s3Draw3D(ctx, cx, cy, R) {
  const isACW = S3.dir === 'acw';
  // Ellipse to show 3D disc perspective
  const ry = R * 0.3;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, R, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#1a2332'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();

  // Axis arrow: ACW = out of screen (upward), CW = into screen (downward)
  if (isACW) {
    drawArrow(ctx, cx, cy + 60, cx, cy - 80, '#3b6fd4', 2.5, 12);
    drawText(ctx, 'ω⃗', cx + 14, cy - 80, { color: '#3b6fd4', size: '14px', weight: 'bold', align: 'left' });
    drawText(ctx, '⊙ out of screen', cx, cy + 78, { color: '#3b6fd4', size: '12px' });
  } else {
    drawArrow(ctx, cx, cy - 60, cx, cy + 80, '#e53935', 2.5, 12);
    drawText(ctx, 'ω⃗', cx + 14, cy + 90, { color: '#e53935', size: '14px', weight: 'bold', align: 'left' });
    drawText(ctx, '⊗ into screen', cx, cy - 72, { color: '#e53935', size: '12px' });
  }

  // Rotating radius on ellipse
  const ex = cx + R * Math.cos(S3.angle);
  const ey = cy + ry * Math.sin(S3.angle);
  drawLine(ctx, cx, cy, ex, ey, { color: '#3b6fd480', lw: 2 });
  drawCircle(ctx, ex, ey, 7, { fill: '#3b6fd4', stroke: '#3b6fd4' });
}

function s3DrawRHR(ctx, cx, cy, R) {
  // Simplified RHR illustration
  const isACW = S3.dir === 'acw';
  drawCircle(ctx, cx, cy, R * 0.6, { lw: 2 });
  // Thumb arrow
  if (isACW) {
    drawArrow(ctx, cx, cy + 50, cx, cy - 80, '#2e7d32', 3, 14);
    drawText(ctx, 'thumb → ω out', cx, cy - 95, { color: '#2e7d32', size: '12px' });
  } else {
    drawArrow(ctx, cx, cy - 50, cx, cy + 80, '#c62828', 3, 14);
    drawText(ctx, 'thumb → ω in', cx, cy + 100, { color: '#c62828', size: '12px' });
  }
  // Curling fingers arc
  const arcColor = isACW ? '#3b6fd4' : '#e53935';
  drawArc(ctx, cx, cy, R * 0.6, 0, isACW ? Math.PI * 1.5 : -Math.PI * 1.5, arcColor, 3, !isACW);
  drawText(ctx, isACW ? '↺ fingers curl anticlockwise' : '↻ fingers curl clockwise',
    cx, cy + R * 0.85, { color: arcColor, size: '12px' });
}

function s3DrawRHRBoth() {
  s3DrawRHRPanel('c3-rhr-acw', false);
  s3DrawRHRPanel('c3-rhr-cw', true);
}

function s3DrawRHRPanel(id, cw) {
  const c = document.getElementById(id);
  if (!c) return;
  const ctx = c.getContext('2d');
  clearCanvas(ctx);
  const W = c.width, H = c.height;
  const cx = W / 2;
  const color = cw ? '#e53935' : '#3b6fd4';
  const fistCY = cw ? H * 0.38 : H * 0.62;
  const fistRX = 22, fistRY = 14;

  // Fist (oval representing curled fingers)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, fistCY, fistRX, fistRY, 0, 0, Math.PI * 2);
  ctx.fillStyle = cw ? '#fce8e8' : '#e8eef8';
  ctx.fill();
  ctx.strokeStyle = color + 'bb';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = color + 'cc'; ctx.font = '7px Segoe UI';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('fingers', cx, fistCY);

  // Finger curl arc (shows rotation direction)
  const arcR = fistRX + 13;
  if (!cw) {
    // ACW: arc sweeps anticlockwise along bottom
    ctx.beginPath();
    ctx.arc(cx, fistCY, arcR, Math.PI * 0.1, Math.PI * 0.9, false);
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    // Arrowhead at end of arc
    const ae = Math.PI * 0.9;
    const ax = cx + arcR * Math.cos(ae), ay = fistCY + arcR * Math.sin(ae);
    const tang = ae + Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - 8 * Math.cos(tang - 0.4), ay - 8 * Math.sin(tang - 0.4));
    ctx.lineTo(ax - 8 * Math.cos(tang + 0.4), ay - 8 * Math.sin(tang + 0.4));
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  } else {
    // CW: arc sweeps clockwise along top
    ctx.beginPath();
    ctx.arc(cx, fistCY, arcR, -Math.PI * 0.9, -Math.PI * 0.1, false);
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    const ae = -Math.PI * 0.1;
    const ax = cx + arcR * Math.cos(ae), ay = fistCY + arcR * Math.sin(ae);
    const tang = ae + Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - 8 * Math.cos(tang - 0.4), ay - 8 * Math.sin(tang - 0.4));
    ctx.lineTo(ax - 8 * Math.cos(tang + 0.4), ay - 8 * Math.sin(tang + 0.4));
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }

  // Thumb arrow (perpendicular to the rotation plane)
  if (!cw) {
    // ACW → thumb OUT of screen → arrow pointing up
    const thumbBase = fistCY - fistRY - 4;
    drawArrow(ctx, cx, thumbBase, cx, 10, color, 3.5, 9);
    ctx.fillStyle = color; ctx.font = 'bold 8px Segoe UI';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('ω out', cx, 11);
  } else {
    // CW → thumb INTO screen → arrow pointing down
    const thumbBase = fistCY + fistRY + 4;
    drawArrow(ctx, cx, thumbBase, cx, H - 10, color, 3.5, 9);
    ctx.fillStyle = color; ctx.font = 'bold 8px Segoe UI';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('ω in', cx, H - 11);
  }
}

// ================================================================
// SCREEN 04 — v = rω
// ================================================================
const S4 = {
  omega: 4.0,
  r1: 0.2,
  r2: 0.45,
  angle: 0,
  animId: null,
  narrationTimeout: null,
};

function s4Init() {
  s4Update();
  if (!S4.animId) s4Animate();

  const box = document.getElementById('s4-controls-box');
  if (box) box.classList.remove('narration-highlight');
  if (S4.narrationTimeout) { clearTimeout(S4.narrationTimeout); S4.narrationTimeout = null; }

  if (!voiceEnabled) return;
  window.speechSynthesis.cancel();

  const part1 = new SpeechSynthesisUtterance(NARRATIONS[4]);
  part1.rate = 0.92; part1.pitch = 1.0;

  part1.onend = () => {
    S4.narrationTimeout = setTimeout(() => {
      S4.narrationTimeout = null;
      const part2 = new SpeechSynthesisUtterance(
        "Use the sliders to change omega, r 1, and r 2. Observe how the linear velocity of each point changes as you vary its distance from the axis."
      );
      part2.rate = 0.92; part2.pitch = 1.0;
      if (box) box.classList.add('narration-highlight');
      part2.onend = () => { if (box) box.classList.remove('narration-highlight'); };
      window.speechSynthesis.speak(part2);
    }, 2000);
  };

  window.speechSynthesis.speak(part1);
}

function s4Update() {
  S4.omega = parseFloat(document.getElementById('s4-sl-omega').value);
  S4.r1    = parseFloat(document.getElementById('s4-sl-r1').value);
  S4.r2    = parseFloat(document.getElementById('s4-sl-r2').value);
  document.getElementById('s4-omega-val').textContent = `ω = ${S4.omega.toFixed(1)} rad/s`;
  document.getElementById('s4-r1-val').textContent    = `r₁ = ${S4.r1.toFixed(2)} m`;
  document.getElementById('s4-r2-val').textContent    = `r₂ = ${S4.r2.toFixed(2)} m`;
  const v1 = (S4.r1 * S4.omega).toFixed(2);
  const v2 = (S4.r2 * S4.omega).toFixed(2);
  document.getElementById('s4-v1').textContent = `${v1} m/s`;
  document.getElementById('s4-v2').textContent = `${v2} m/s`;
  const r1disp = document.getElementById('s4-r1-disp');
  const r2disp = document.getElementById('s4-r2-disp');
  if (r1disp) r1disp.textContent = S4.r1.toFixed(2);
  if (r2disp) r2disp.textContent = S4.r2.toFixed(2);
  const ratioEl = document.getElementById('s4-ratio');
  if (ratioEl) ratioEl.textContent = (S4.r1 / S4.r2).toFixed(2);
}

function s4Animate() {
  function loop() {
    S4.angle += S4.omega * 0.008;
    s4Draw();
    S4.animId = requestAnimationFrame(loop);
  }
  S4.animId = requestAnimationFrame(loop);
}

function s4Draw() {
  const c = document.getElementById('c4');
  if (!c) return;
  const ctx = c.getContext('2d');
  clearCanvas(ctx);
  const cx = c.width / 2, cy = c.height / 2;
  const scale = Math.min(cx, cy) - 30;  // px per metre (r=1 → scale px)
  const R = scale;

  drawCircle(ctx, cx, cy, R, { lw: 2 });
  const r1px = S4.r1 * scale;
  const r2px = S4.r2 * scale;

  // Point 1 (inner, grey)
  const p1x = cx + r1px * Math.cos(S4.angle);
  const p1y = cy + r1px * Math.sin(S4.angle);
  drawLine(ctx, cx, cy, cx + r1px * Math.cos(S4.angle) * 1.05, cy + r1px * Math.sin(S4.angle) * 1.05, { color: '#888', lw: 1.5 });
  drawCircle(ctx, p1x, p1y, 8, { fill: '#888', stroke: '#888' });

  // v1 tangent arrow
  const v1 = S4.r1 * S4.omega;
  const tang1 = S4.angle + Math.PI / 2;
  drawArrow(ctx, p1x, p1y,
    p1x + v1 * 12 * Math.cos(tang1), p1y + v1 * 12 * Math.sin(tang1),
    '#888', 1.5, 7);
  drawText(ctx, 'v₁', p1x + v1 * 14 * Math.cos(tang1) + 4,
    p1y + v1 * 14 * Math.sin(tang1), { color: '#888', size: '12px', align: 'left' });

  // r1 label
  drawText(ctx, 'r₁', cx + (r1px / 2) * Math.cos(S4.angle),
    cy + (r1px / 2) * Math.sin(S4.angle) - 10, { color: '#888', size: '11px' });

  // Point 2 (outer, blue)
  const p2x = cx + r2px * Math.cos(S4.angle);
  const p2y = cy + r2px * Math.sin(S4.angle);
  drawLine(ctx, cx, cy, p2x, p2y, { color: '#3b6fd4', lw: 2.5 });
  drawCircle(ctx, p2x, p2y, 10, { fill: '#3b6fd4', stroke: '#3b6fd4' });

  // v2 tangent arrow
  const v2 = S4.r2 * S4.omega;
  const tang2 = S4.angle + Math.PI / 2;
  drawArrow(ctx, p2x, p2y,
    p2x + v2 * 10 * Math.cos(tang2), p2y + v2 * 10 * Math.sin(tang2),
    '#3b6fd4', 2, 9);
  drawText(ctx, 'v₂', p2x + v2 * 12 * Math.cos(tang2) + 4,
    p2y + v2 * 12 * Math.sin(tang2), { color: '#3b6fd4', size: '12px', align: 'left', weight: 'bold' });

  // r2 label
  drawText(ctx, 'r₂', cx + (r2px / 2) * Math.cos(S4.angle),
    cy + (r2px / 2) * Math.sin(S4.angle) - 14, { color: '#3b6fd4', size: '11px' });

  // Center
  drawCircle(ctx, cx, cy, 6, { fill: '#1a2332', stroke: '#1a2332' });

  // Update labels
  s4Update();
}

// ================================================================
// SCREEN 05 — Multiple Representations
// ================================================================
const S6_MOTIONS = [
  { id: 'const',     label: 'Constant Speed',       correctA: 'A', correctB: 'A' },
  { id: 'accel',     label: 'Speeding Up (ω↑)',      correctA: 'B', correctB: 'B' },
  { id: 'decel',     label: 'Slowing Down (ω↓)',     correctA: 'C', correctB: 'C' },
  { id: 'oscillate', label: 'Oscillating Speed',     correctA: 'D', correctB: 'D' },
];
const S6 = {
  angle: 0,
  time: 0,
  motionIdx: 0,
  animId: null,
  animStartTs: null,
  chosenA: null,
  chosenB: null,
};

function s6ClearHighlights() {
  ['s6-challenge-a', 's6-challenge-b'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('narration-highlight');
  });
}

function s6OnAnimStop() {
  if (!voiceEnabled) return;
  const panA = document.getElementById('s6-challenge-a');
  const panB = document.getElementById('s6-challenge-b');
  const utt = new SpeechSynthesisUtterance(
    "The rotation has stopped. Now select the theta-time graph that matches the motion in Challenge A, and the omega-time graph in Challenge B."
  );
  utt.rate = 0.92; utt.pitch = 1.0;
  utt.onstart = () => {
    if (panA) panA.classList.add('narration-highlight');
    if (panB) panB.classList.add('narration-highlight');
  };
  utt.onend = () => { s6ClearHighlights(); };
  window.speechSynthesis.speak(utt);
}

function s6Init() {
  S6.motionIdx = 0;
  S6.time = 0;
  S6.angle = 0;
  S6.chosenA = null;
  S6.chosenB = null;
  s6ClearHighlights();
  ['A', 'B', 'C', 'D'].forEach(x => {
    const ea = document.getElementById('s6ca-' + x);
    if (ea) ea.className = 'choice-item';
    const eb = document.getElementById('s6cb-' + x);
    if (eb) eb.className = 'choice-item';
  });
  document.getElementById('s6-ca-feedback').textContent = '';
  document.getElementById('s6-cb-feedback').textContent = '';
  s6DrawChoicesA();
  s6DrawChoicesB();
  s6Animate();
  narrate(NARRATIONS[6]);
}

function s6GetOmega() {
  const t = S6.time * 0.01;
  switch (S6_MOTIONS[S6.motionIdx].id) {
    case 'const':     return 1.5;
    case 'accel':     return Math.min(0.4 + t, 3.0);
    case 'decel':     return Math.max(3.0 - t, 0.25);
    case 'oscillate': return 1.0 + 0.85 * Math.sin(S6.time * 0.05);
  }
  return 1.5;
}

function s6Animate() {
  if (S6.animId) { cancelAnimationFrame(S6.animId); S6.animId = null; }
  S6.animStartTs = null;
  function loop(ts) {
    if (!S6.animStartTs) S6.animStartTs = ts;
    if (ts - S6.animStartTs >= 5000) {
      S6.animId = null;
      s6OnAnimStop();
      return;
    }
    S6.time += 1;
    S6.angle += s6GetOmega() * 0.015;
    s6DrawMain();
    S6.animId = requestAnimationFrame(loop);
  }
  S6.animId = requestAnimationFrame(loop);
}

function s6DrawMain() {
  const c = document.getElementById('c6a');
  if (!c) return;
  const ctx = c.getContext('2d');
  clearCanvas(ctx);
  const cx = c.width / 2, cy = c.height / 2, R = Math.min(cx, cy) - 22;

  drawCircle(ctx, cx, cy, R, { lw: 2 });
  const px = cx + R * Math.cos(S6.angle), py = cy + R * Math.sin(S6.angle);
  drawLine(ctx, cx, cy, px, py, { color: '#3b6fd4', lw: 2.5 });
  drawCircle(ctx, px, py, 9, { fill: '#3b6fd4', stroke: '#3b6fd4' });
  drawCircle(ctx, cx, cy, 5, { fill: '#1a2332', stroke: '#1a2332' });

  // Rotation arc — arc length scales with current ω to give visual hint
  const omega = s6GetOmega();
  const arcSpan = Math.min(omega * 0.5, Math.PI * 1.5);
  drawArc(ctx, cx, cy, R * 0.32, S6.angle - arcSpan, S6.angle, '#3b6fd490', 3);

}

function s6DrawChoicesA() {
  const shapes = {
    A: (ctx, W, H) => {
      // Linear rise — constant ω
      ctx.beginPath(); ctx.strokeStyle = '#3b6fd4'; ctx.lineWidth = 1.5;
      ctx.moveTo(6, H - 8); ctx.lineTo(W - 6, 8); ctx.stroke();
    },
    B: (ctx, W, H) => {
      // Upward curve (parabola) — accelerating ω
      ctx.beginPath(); ctx.strokeStyle = '#3b6fd4'; ctx.lineWidth = 1.5;
      const n = 30;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const x = 6 + t * (W - 12);
        const y = (H - 8) - t * t * (H - 16);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    },
    C: (ctx, W, H) => {
      // Flattening curve (sqrt) — decelerating ω
      ctx.beginPath(); ctx.strokeStyle = '#3b6fd4'; ctx.lineWidth = 1.5;
      const n = 30;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const x = 6 + t * (W - 12);
        const y = (H - 8) - Math.sqrt(t) * (H - 16);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    },
    D: (ctx, W, H) => {
      // Wavy rise — oscillating ω
      ctx.beginPath(); ctx.strokeStyle = '#3b6fd4'; ctx.lineWidth = 1.5;
      const n = 50;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const x = 6 + t * (W - 12);
        const y = (H - 8) - (t + 0.12 * Math.sin(t * 4 * Math.PI)) * (H - 16);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    },
  };
  ['A', 'B', 'C', 'D'].forEach(k => {
    const c = document.getElementById('g6ca-' + k);
    if (!c) return;
    const ctx = c.getContext('2d');
    clearCanvas(ctx);
    ctx.strokeStyle = '#aab8cc'; ctx.lineWidth = 0.8;
    ctx.strokeRect(4, 4, c.width - 8, c.height - 8);
    ctx.fillStyle = '#888'; ctx.font = '8px Segoe UI';
    ctx.textAlign = 'center'; ctx.fillText('t', c.width - 6, c.height - 2);
    ctx.textAlign = 'right'; ctx.fillText('θ', 10, 12);
    shapes[k](ctx, c.width, c.height);
  });
}

function s6DrawChoicesB() {
  // Challenge B: pick ω–t graph matching the uniform CCW rotation above
  const graphs = {
    A: (ctx, W, H) => {
      // Flat horizontal line — constant ω (CORRECT for uniform rotation)
      ctx.beginPath(); ctx.strokeStyle = '#3b6fd4'; ctx.lineWidth = 1.5;
      ctx.moveTo(6, H / 2); ctx.lineTo(W - 6, H / 2); ctx.stroke();
    },
    B: (ctx, W, H) => {
      // Rising line — increasing ω
      ctx.beginPath(); ctx.strokeStyle = '#3b6fd4'; ctx.lineWidth = 1.5;
      ctx.moveTo(6, H - 8); ctx.lineTo(W - 6, 8); ctx.stroke();
    },
    C: (ctx, W, H) => {
      // Falling line — decreasing ω
      ctx.beginPath(); ctx.strokeStyle = '#3b6fd4'; ctx.lineWidth = 1.5;
      ctx.moveTo(6, 8); ctx.lineTo(W - 6, H - 8); ctx.stroke();
    },
    D: (ctx, W, H) => {
      // Oscillating — variable ω
      ctx.beginPath(); ctx.strokeStyle = '#3b6fd4'; ctx.lineWidth = 1.5;
      const pts = 40;
      for (let i = 0; i <= pts; i++) {
        const x = 6 + (i / pts) * (W - 12);
        const y = H / 2 + (H / 3) * Math.sin((i / pts) * 2 * Math.PI);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    },
  };
  ['A', 'B', 'C', 'D'].forEach(k => {
    const c = document.getElementById('g6cb-' + k);
    if (!c) return;
    const ctx = c.getContext('2d');
    clearCanvas(ctx);
    ctx.strokeStyle = '#aab8cc'; ctx.lineWidth = 0.8;
    ctx.strokeRect(4, 4, c.width - 8, c.height - 8);
    ctx.fillStyle = '#888'; ctx.font = '8px Segoe UI';
    ctx.textAlign = 'center'; ctx.fillText('t', c.width - 6, c.height - 2);
    ctx.textAlign = 'right'; ctx.fillText('ω', 10, 12);
    graphs[k](ctx, c.width, c.height);
  });
}

function s6ChooseA(k) {
  if (S6.chosenA !== null) return;
  S6.chosenA = k;
  const correct = S6_MOTIONS[S6.motionIdx].correctA;
  ['A', 'B', 'C', 'D'].forEach(x => {
    const el = document.getElementById('s6ca-' + x);
    el.className = 'choice-item';
    if (x === k)       el.className += k === correct ? ' correct' : ' wrong';
    else if (x === correct && k !== correct) el.className += ' correct';
  });
  const fb = document.getElementById('s6-ca-feedback');
  fb.style.color = k === correct ? 'var(--correct)' : 'var(--incorrect)';
  fb.textContent = s6FeedbackA(k === correct);
}

function s6ChooseB(k) {
  if (S6.chosenB !== null) return;
  S6.chosenB = k;
  const correct = S6_MOTIONS[S6.motionIdx].correctB;
  ['A', 'B', 'C', 'D'].forEach(x => {
    const el = document.getElementById('s6cb-' + x);
    el.className = 'choice-item';
    if (x === k)       el.className += k === correct ? ' correct' : ' wrong';
    else if (x === correct && k !== correct) el.className += ' correct';
  });
  const fb = document.getElementById('s6-cb-feedback');
  fb.style.color = k === correct ? 'var(--correct)' : 'var(--incorrect)';
  fb.textContent = s6FeedbackB(k === correct);
}

function s6FeedbackA(isCorrect) {
  const id = S6_MOTIONS[S6.motionIdx].id;
  if (isCorrect) {
    return { const: '✓ Correct! Constant ω → equal Δθ each second → straight θ–t line (A).',
             accel: '✓ Correct! Increasing ω → θ grows faster over time → upward curve (B).',
             decel: '✓ Correct! Decreasing ω → θ still grows but more slowly → flattening curve (C).',
             oscillate: '✓ Correct! Oscillating ω → θ growth alternates fast/slow → wavy curve (D).' }[id];
  }
  return { const: '✗ Constant ω → equal Δθ per second → straight line (A).',
           accel: '✗ Increasing ω means θ accumulates faster → upward curve (B).',
           decel: '✗ Decreasing ω still adds θ but more slowly → flattening curve (C).',
           oscillate: '✗ Oscillating ω → θ grows unevenly → wavy curve (D).' }[id];
}

function s6FeedbackB(isCorrect) {
  const id = S6_MOTIONS[S6.motionIdx].id;
  if (isCorrect) {
    return { const: '✓ Correct! Constant speed → ω unchanged → flat horizontal ω–t graph (A).',
             accel: '✓ Correct! Speeding up → ω rises with time → rising line (B).',
             decel: '✓ Correct! Slowing down → ω falls with time → falling line (C).',
             oscillate: '✓ Correct! Oscillating speed → ω varies → sinusoidal ω–t graph (D).' }[id];
  }
  return { const: '✗ Constant speed → ω fixed → flat line (A).',
           accel: '✗ Speeding up → ω increases → rising slope (B).',
           decel: '✗ Slowing down → ω decreases → falling slope (C).',
           oscillate: '✗ Oscillating speed → ω alternates → sinusoidal curve (D).' }[id];
}

function s6RotateAgain() {
  stopNarration();
  s6ClearHighlights();
  S6.motionIdx = (S6.motionIdx + 1) % S6_MOTIONS.length;
  S6.time = 0;
  S6.angle = 0;
  S6.chosenA = null;
  S6.chosenB = null;
  ['A', 'B', 'C', 'D'].forEach(x => {
    const ea = document.getElementById('s6ca-' + x);
    if (ea) ea.className = 'choice-item';
    const eb = document.getElementById('s6cb-' + x);
    if (eb) eb.className = 'choice-item';
  });
  document.getElementById('s6-ca-feedback').textContent = '';
  document.getElementById('s6-cb-feedback').textContent = '';
  s6DrawChoicesA();
  s6DrawChoicesB();
  s6Animate();
}

// ================================================================
// SCREEN 07 — MCQ 1
// ================================================================
const S7 = { answered: false };

function s7Init() {
  const sol = document.getElementById('s7-solution');
  if (S7.answered) {
    if (sol) sol.style.display = '';
    narrate(NARRATIONS[7]);
    return;
  }
  const btns = document.getElementById('s7-choices').querySelectorAll('.choice-btn');
  btns.forEach(b => { b.className = 'choice-btn'; b.disabled = false; b.querySelector('.checkmark').textContent = ''; });
  if (sol) sol.style.display = 'none';
  narrate(NARRATIONS[7]);
}

function s7Choose(k) {
  if (S7.answered) return;
  S7.answered = true;
  const correct = 'B';
  const btns = document.getElementById('s7-choices').querySelectorAll('.choice-btn');
  btns.forEach((b, i) => {
    const letter = ['A','B','C','D'][i];
    b.disabled = true;
    if (letter === correct) {
      b.classList.add('chosen-correct');
      b.querySelector('.checkmark').textContent = ' ✓';
    } else if (letter === k && k !== correct) {
      b.classList.add('chosen-wrong');
      b.querySelector('.checkmark').textContent = ' ✗';
    }
  });
  const sol = document.getElementById('s7-solution');
  if (sol) sol.style.display = '';
  narrate(k === 'B' ? MCQ_FEEDBACK.s7.correct : MCQ_FEEDBACK.s7.wrong);
}

// ================================================================
// SCREEN 08 — MCQ 2
// ================================================================
const S8 = { answered: false };

function s8Init() {
  const sol = document.getElementById('s8-solution');
  if (S8.answered) {
    if (sol) sol.style.display = '';
    narrate(NARRATIONS[8]);
    return;
  }
  const btns = document.getElementById('s8-choices').querySelectorAll('.choice-btn');
  btns.forEach(b => { b.className = 'choice-btn'; b.disabled = false; b.querySelector('.checkmark').textContent = ''; });
  if (sol) sol.style.display = 'none';
  narrate(NARRATIONS[8]);
}

function s8Choose(k) {
  if (S8.answered) return;
  S8.answered = true;
  const correct = 'C';
  const btns = document.getElementById('s8-choices').querySelectorAll('.choice-btn');
  btns.forEach((b, i) => {
    const letter = ['A','B','C','D'][i];
    b.disabled = true;
    if (letter === correct) {
      b.classList.add('chosen-correct');
      b.querySelector('.checkmark').textContent = ' ✓';
    } else if (letter === k && k !== correct) {
      b.classList.add('chosen-wrong');
      b.querySelector('.checkmark').textContent = ' ✗';
    }
  });
  const sol = document.getElementById('s8-solution');
  if (sol) sol.style.display = '';
  narrate(k === 'C' ? MCQ_FEEDBACK.s8.correct : MCQ_FEEDBACK.s8.wrong);
}

// ================================================================
// INIT
// ================================================================
window.addEventListener('DOMContentLoaded', () => {
  updateDots();
  updateHeader();

  // Sync voice button to persisted state before first narration
  const btn = document.getElementById('voiceBtn');
  if (!voiceEnabled) {
    btn.textContent = '🔇';
    btn.classList.add('muted');
    btn.title = 'Unmute narration';
  }

  s1Init();

  // Browsers block speechSynthesis until a user gesture. The Start overlay
  // provides that one gesture; its click primes speech and narrates screen 1.
  const startOverlay = document.getElementById('startOverlay');
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (startOverlay) startOverlay.classList.add('hidden');
      primeSpeech();
    });
  } else if (startOverlay) {
    startOverlay.classList.add('hidden');
  }
  // Fallback: if the overlay is somehow dismissed another way, any first
  // interaction still primes speech.
  ['pointerdown', 'keydown', 'touchstart'].forEach(evt =>
    window.addEventListener(evt, primeSpeech, { once: true })
  );
  // Voices load asynchronously in some browsers; nudge them along.
  if (window.speechSynthesis && speechSynthesis.getVoices().length === 0) {
    speechSynthesis.addEventListener('voiceschanged', () => {}, { once: true });
  }

  // Cleanup animIds on screen change so animations don't pile up
  const origGoTo = goTo;
  window.goTo = function(n) {
    [S2, S3, S4, S6].forEach(s => {
      if (s.animId) { cancelAnimationFrame(s.animId); s.animId = null; }
    });
    if (S2.narrationTimeout) { clearTimeout(S2.narrationTimeout); S2.narrationTimeout = null; }
    const s2box = document.getElementById('s2-controls-box');
    if (s2box) s2box.classList.remove('narration-highlight');
    const s2units = document.getElementById('s2-units-section');
    if (s2units) s2units.classList.remove('narration-highlight');
    if (S3.narrationTimeout) { clearTimeout(S3.narrationTimeout); S3.narrationTimeout = null; }
    const s3view = document.getElementById('s3-view-box');
    if (s3view) s3view.classList.remove('narration-highlight');
    if (S4.narrationTimeout) { clearTimeout(S4.narrationTimeout); S4.narrationTimeout = null; }
    const s4box = document.getElementById('s4-controls-box');
    if (s4box) s4box.classList.remove('narration-highlight');
    s6ClearHighlights();
    stopNarration();
    origGoTo(n);
  };
});
