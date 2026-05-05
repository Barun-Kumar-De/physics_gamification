/* ═══════════════════════════════════════════════════════════
   State
════════════════════════════════════════════════════════════ */
const CORRECT = 'B';
const state = {
  selected: null,
  timerSeconds: 0,
  timerInterval: null,
  solvedSeconds: 0,
  voiceEnabled: true,
  animPlaying: false,
  animRAF: null,
  animProgress: 0,
  currentScreen: 1,
};

// Voice queue tracker
const voiceQ = {
  queue: [],
  idx: 0,
  playing: false,
  paused: false,
  screenNum: 0,
};

/* ═══════════════════════════════════════════════════════════
   Screen navigation
════════════════════════════════════════════════════════════ */
function showScreen(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + n).classList.add('active');
  state.currentScreen = n;

  if (n === 2) renderResult();
  if (n === 3) { initDiagram(); startVoice(3); }
  if (n === 4) { triggerReveal('screen-4'); startVoice(4); }
  if (n === 5) { triggerReveal('screen-5'); startVoice(5); }
}

/* ═══════════════════════════════════════════════════════════
   Timer (Screen 1)
════════════════════════════════════════════════════════════ */
function formatTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return m + ':' + ss;
}

function startTimer() {
  state.timerInterval = setInterval(() => {
    state.timerSeconds++;
    document.getElementById('elapsed-time').textContent = formatTime(state.timerSeconds);
  }, 1000);
}

/* ═══════════════════════════════════════════════════════════
   Option selection (Screen 1)
════════════════════════════════════════════════════════════ */
function bindOptions() {
  document.querySelectorAll('#options-q1 .option-card').forEach(card => {
    card.addEventListener('click', () => selectOption(card.dataset.option));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') selectOption(card.dataset.option);
    });
  });
}

function selectOption(opt) {
  if (state.selected !== null) return;
  state.selected = opt;
  document.querySelectorAll('#options-q1 .option-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.option === opt);
  });
  const btn = document.getElementById('submit-btn');
  btn.disabled = false;
  btn.classList.remove('disabled');
}

/* ═══════════════════════════════════════════════════════════
   Submit (Screen 1 → Screen 2)
════════════════════════════════════════════════════════════ */
document.getElementById('submit-btn').addEventListener('click', () => {
  if (!state.selected) return;
  clearInterval(state.timerInterval);
  state.solvedSeconds = state.timerSeconds;
  document.querySelectorAll('#options-q1 .option-card').forEach(c => c.classList.add('locked'));
  showScreen(2);
});

/* ═══════════════════════════════════════════════════════════
   Keyboard shortcuts
════════════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (state.currentScreen === 1) {
    if (['a','b','c','d'].includes(e.key.toLowerCase())) selectOption(e.key.toUpperCase());
    if (e.key === 'Enter') document.getElementById('submit-btn').click();
  }
  if (state.currentScreen === 3) {
    if (e.key === 'ArrowRight') showScreen(4);
    if (e.key === 'ArrowLeft')  showScreen(2);
  }
  if (state.currentScreen === 4) {
    if (e.key === 'ArrowRight') showScreen(5);
    if (e.key === 'ArrowLeft')  showScreen(3);
  }
  if (state.currentScreen === 5) {
    if (e.key === 'ArrowLeft') showScreen(4);
  }
});

/* ═══════════════════════════════════════════════════════════
   Result screen
════════════════════════════════════════════════════════════ */
function renderResult() {
  const isCorrect = state.selected === CORRECT;

  const banner = document.getElementById('result-banner');
  banner.className = 'result-banner ' + (isCorrect ? 'result-correct' : 'result-incorrect');

  const icon = banner.querySelector('.result-icon');
  icon.textContent = isCorrect ? '✓' : '✕';
  icon.className = 'result-icon ' + (isCorrect ? 'result-icon-right' : 'result-icon-wrong');
  banner.querySelector('.result-title').textContent = isCorrect ? 'Correct!' : 'Incorrect';

  const opts = [{l:'A',v:'15'},{l:'B',v:'5'},{l:'C',v:'10'},{l:'D',v:'7.5'}];
  const sel = opts.find(o => o.l === state.selected);
  document.getElementById('your-answer-label').textContent = sel ? sel.l + ' · ' + sel.v : '—';

  const marksEl = document.getElementById('marks-label');
  if (isCorrect) { marksEl.textContent = '+4 marks'; marksEl.className = 'marks-pos'; }
  else           { marksEl.textContent = '−1 mark';  marksEl.className = 'marks-neg'; }

  document.getElementById('result-meta-text').textContent =
    'Solved in ' + formatTime(state.solvedSeconds) + ' · Difficulty: Hard';

  ['A','B','C','D'].forEach(l => {
    const card = document.querySelector('#result-options .option-card[data-option="' + l + '"]');
    const chip = document.getElementById('chip-' + l);
    card.className = 'option-card result-card locked';
    chip.textContent = '';
    chip.className = 'result-chip';

    if (l === CORRECT) {
      card.classList.add('correct-answer');
      chip.textContent = 'Correct answer';
      chip.classList.add('chip-correct');
    }
    if (l === state.selected && l !== CORRECT) {
      card.classList.add('your-wrong-choice');
      chip.textContent = 'Your choice';
      chip.classList.add('chip-wrong');
    }
    if (l === state.selected && l === CORRECT) {
      card.classList.add('your-correct-choice');
      chip.textContent = 'Your choice ✓';
      chip.classList.add('chip-correct');
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   Reveal animation (Screens 4 & 5)
════════════════════════════════════════════════════════════ */
function triggerReveal(screenId) {
  const cards = document.querySelectorAll('#' + screenId + ' .reveal-card');
  cards.forEach((c, i) => {
    c.classList.remove('visible');
    setTimeout(() => c.classList.add('visible'), 150 + i * 180);
  });
}

/* ═══════════════════════════════════════════════════════════
   Cylinder canvas drawing
════════════════════════════════════════════════════════════ */
function drawCylinder(canvasId, vRatio, omegaRatio, showForces) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2 - 10, R = 58;

  ctx.strokeStyle = '#999'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(20, cy + R + 2); ctx.lineTo(W - 20, cy + R + 2); ctx.stroke();
  ctx.lineWidth = 1;
  for (let x = 24; x < W - 20; x += 12) {
    ctx.beginPath(); ctx.moveTo(x, cy + R + 2); ctx.lineTo(x - 8, cy + R + 10); ctx.stroke();
  }

  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#f0f2f8'; ctx.fill();

  ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a2e'; ctx.fill();

  const vLen = 20 + vRatio * 60;
  drawArrow(ctx, cx + 5, cy, cx + 5 + vLen, cy, '#4a6cf7', 2);
  ctx.fillStyle = '#4a6cf7'; ctx.font = 'bold 13px sans-serif';
  ctx.fillText('v', cx + 8 + vLen, cy - 5);

  const omLen = 10 + omegaRatio * 45;
  ctx.strokeStyle = '#8b20c0'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, omLen, -Math.PI * 0.7, Math.PI * 0.7); ctx.stroke();
  const endX = cx + omLen * Math.cos(Math.PI * 0.7);
  const endY = cy + omLen * Math.sin(Math.PI * 0.7);
  drawArrow(ctx, endX, endY - 3, endX + 1, endY + 1, '#8b20c0', 2);
  ctx.fillStyle = '#8b20c0'; ctx.font = 'bold 13px sans-serif';
  ctx.fillText('ω', cx - 8, cy + 5);

  if (!showForces) return;

  drawArrow(ctx, cx, cy - R - 2, cx, cy - R - 30, '#2e8b57', 2);
  ctx.fillStyle = '#2e8b57'; ctx.font = 'bold 13px sans-serif';
  ctx.fillText('N', cx + 4, cy - R - 32);

  drawArrow(ctx, cx, cy + 10, cx, cy + 36, '#e07000', 2);
  ctx.fillStyle = '#e07000'; ctx.font = 'bold 12px sans-serif';
  ctx.fillText('mg', cx + 4, cy + 46);

  drawArrow(ctx, cx - 10, cy + R, cx - 46, cy + R, '#e05252', 2);
  ctx.fillStyle = '#e05252'; ctx.font = 'bold 12px sans-serif';
  ctx.fillText('f_k', cx - 62, cy + R - 5);
}

function drawArrow(ctx, x1, y1, x2, y2, color, lw) {
  const angle = Math.atan2(y2 - y1, x2 - x1), hs = 8;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hs * Math.cos(angle - 0.4), y2 - hs * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - hs * Math.cos(angle + 0.4), y2 - hs * Math.sin(angle + 0.4));
  ctx.closePath(); ctx.fill();
}

/* ═══════════════════════════════════════════════════════════
   Diagram init & animation (Screen 3)
════════════════════════════════════════════════════════════ */
function initDiagram() {
  state.animProgress = 0;
  drawCylinder('canvas-initial', 1.0, 0.25, true);
  drawCylinder('canvas-final',   0.45, 0.45, false);
  triggerReveal('screen-3');
  setTimeout(() => playAnimation(), 600);
}

function playAnimation() {
  if (state.animPlaying) return;
  state.animPlaying = true;
  document.getElementById('anim-btn').textContent = '⏸ PAUSE';

  const START_PROGRESS = state.animProgress;
  const DURATION = 2200;
  const t0 = performance.now();

  function tick(now) {
    const frac = Math.min((now - t0) / DURATION, 1);
    state.animProgress = START_PROGRESS + (1 - START_PROGRESS) * frac;
    document.getElementById('scrub').value = state.animProgress * 100;
    const vRatio = 1.0 - state.animProgress * 0.55;
    const oRatio = 0.25 + state.animProgress * 0.20;
    drawCylinder('canvas-initial', vRatio, oRatio, true);
    if (frac < 1) {
      state.animRAF = requestAnimationFrame(tick);
    } else {
      state.animPlaying = false;
      document.getElementById('anim-btn').textContent = '▶ REPLAY';
    }
  }
  state.animRAF = requestAnimationFrame(tick);
}

function pauseAnimation() {
  if (!state.animPlaying) return;
  cancelAnimationFrame(state.animRAF);
  state.animPlaying = false;
  document.getElementById('anim-btn').textContent = '▶ RESUME';
}

function toggleAnimation() {
  if (state.animPlaying) {
    pauseAnimation();
  } else {
    if (state.animProgress >= 1) state.animProgress = 0;
    playAnimation();
  }
}

document.getElementById('scrub').addEventListener('input', function () {
  pauseAnimation();
  state.animProgress = this.value / 100;
  const vRatio = 1.0 - state.animProgress * 0.55;
  const oRatio = 0.25 + state.animProgress * 0.20;
  drawCylinder('canvas-initial', vRatio, oRatio, true);
  document.getElementById('anim-btn').textContent = '▶ RESUME';
});

/* ═══════════════════════════════════════════════════════════
   Voice narration — chained segmented system
════════════════════════════════════════════════════════════ */

function buildQueue4() {
  return [
    { text: "Let's set up the equations. There are two coupled motions: linear retardation and angular acceleration.", highlightId: null },
    { text: "For linear motion: kinetic friction force equals mu-k times N, which equals mu-k times m times g.", highlightId: 'eq-card-1' },
    { text: "By Newton's second law: negative mu-k m g equals m times a, so acceleration a equals negative mu-k g.", highlightId: 'eq-card-2' },
    { text: "So the translational velocity at time t is: v equals v-naught minus mu-k g times t.", highlightId: 'eq-card-3' },
    { text: "For rotational motion: the torque about the center equals the friction force times radius, giving mu-k m g times R.", highlightId: 'eq-card-4' },
    { text: "The moment of inertia is one-half m R squared. Using torque equals I alpha, angular acceleration alpha equals 2 mu-k g over R.", highlightId: 'eq-card-5' },
    { text: "Therefore the angular velocity at time t is: omega equals v-naught over 4R, plus 2 mu-k g over R times t.", highlightId: 'eq-card-6' },
  ];
}

function buildQueue5() {
  return [
    { text: "Now we solve. Apply the rolling condition: v equals omega times R.", highlightId: null },
    { text: "Substituting both expressions: v-naught minus mu-k g t equals v-naught over 4 plus 2 mu-k g t. Rearranging: three-quarters of v-naught equals 3 mu-k g t. Therefore t equals v-naught divided by 4 mu-k g.", highlightId: null },
    { text: "Now substituting the values: v-naught equals 49 meters per second, mu-k equals 0.25, and g equals 9.8 meters per second squared. t equals 49 divided by 4 times 0.25 times 9.8, which simplifies to 49 over 9.8, giving t equals 5 seconds. The answer is Option B.", highlightId: 'sub-panel-s5' },
  ];
}

function clearHighlights() {
  document.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
}

function getPreferredVoice() {
  const voices = window.speechSynthesis.getVoices();
  return voices.find(v =>
    v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
  ) || voices.find(v => v.lang.startsWith('en')) || null;
}

function playNextSegment() {
  if (!voiceQ.playing || voiceQ.idx >= voiceQ.queue.length) {
    voiceQ.playing = false;
    clearHighlights();
    updateVoiceCtrlBtn(voiceQ.screenNum);
    return;
  }

  const segment = voiceQ.queue[voiceQ.idx];
  clearHighlights();
  if (segment.highlightId) {
    const el = document.getElementById(segment.highlightId);
    if (el) el.classList.add('highlighted');
  }

  const utterance = new SpeechSynthesisUtterance(segment.text);
  utterance.rate = 0.92;
  utterance.pitch = 1.0;
  utterance.lang = 'en-US';
  const preferred = getPreferredVoice();
  if (preferred) utterance.voice = preferred;

  utterance.onend = () => {
    voiceQ.idx++;
    if (voiceQ.playing) playNextSegment();
  };

  window.speechSynthesis.speak(utterance);
}

function playVoiceQueue(queue, fromIdx, screenNum) {
  if (!state.voiceEnabled) return;
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  clearHighlights();

  voiceQ.queue = queue;
  voiceQ.idx = fromIdx;
  voiceQ.playing = true;
  voiceQ.paused = false;
  voiceQ.screenNum = screenNum;

  updateVoiceCtrlBtn(screenNum);
  playNextSegment();
}

function pauseVoiceQueue() {
  if (!voiceQ.playing) return;
  window.speechSynthesis.cancel();
  voiceQ.playing = false;
  voiceQ.paused = true;
  clearHighlights();
  updateVoiceCtrlBtn(voiceQ.screenNum);
}

function resumeVoiceQueue() {
  if (!voiceQ.paused || !state.voiceEnabled) return;
  voiceQ.playing = true;
  voiceQ.paused = false;
  updateVoiceCtrlBtn(voiceQ.screenNum);
  playNextSegment();
}

function buildQueueForScreen(screenNum) {
  if (screenNum === 3) return buildQueue3();
  if (screenNum === 4) return buildQueue4();
  return buildQueue5();
}

function toggleVoiceScreen(screenNum) {
  if (voiceQ.playing && voiceQ.screenNum === screenNum) {
    pauseVoiceQueue();
  } else if (voiceQ.paused && voiceQ.screenNum === screenNum) {
    resumeVoiceQueue();
  } else {
    playVoiceQueue(buildQueueForScreen(screenNum), 0, screenNum);
  }
}

function restartVoiceScreen(screenNum) {
  playVoiceQueue(buildQueueForScreen(screenNum), 0, screenNum);
}

function updateVoiceCtrlBtn(screenNum) {
  const btn = document.getElementById('voice-ctrl-' + screenNum);
  if (!btn) return;
  if (voiceQ.playing && voiceQ.screenNum === screenNum) {
    btn.textContent = '⏸ Pause Narration';
  } else if (voiceQ.paused && voiceQ.screenNum === screenNum) {
    btn.textContent = '▶ Resume Narration';
  } else {
    btn.textContent = '▶ Play Narration';
  }
  // Keep restart button always enabled label-neutral
}

function buildQueue3() {
  return [
    { text: "The cylinder is slipping on the surface. This means translational velocity v is greater than R omega.", highlightId: 'concept-primer' },
    { text: "Friction acts backward at the contact point — it slows down the translation and speeds up the rotation.", highlightId: 'transition-block' },
    { text: "We need to find the time at which v equals R omega, the condition for pure rolling.", highlightId: null },
    { text: "Watch the diagram: the velocity arrow shrinks while the angular velocity grows —", highlightId: 'initial-state' },
    { text: "until they match at t equals 5 seconds.", highlightId: 'final-state' },
  ];
}

function startVoice(screenNum) {
  window.speechSynthesis.cancel();
  voiceQ.playing = false;
  voiceQ.paused = false;
  clearHighlights();

  if (screenNum === 3 || screenNum === 4 || screenNum === 5) {
    updateVoiceCtrlBtn(screenNum);
    playVoiceQueue(buildQueueForScreen(screenNum), 0, screenNum);
  }
}

function stopVoice() {
  window.speechSynthesis.cancel();
  voiceQ.playing = false;
  voiceQ.paused = false;
  clearHighlights();
  updateVoiceCtrlBtn(3);
  updateVoiceCtrlBtn(4);
  updateVoiceCtrlBtn(5);
}

// Voices may load async — no-op handler satisfies the API
window.speechSynthesis.onvoiceschanged = () => {};

/* ─── Global mute toggle ─── */
document.getElementById('voice-toggle').addEventListener('click', () => {
  state.voiceEnabled = !state.voiceEnabled;
  const btn = document.getElementById('voice-toggle');
  if (state.voiceEnabled) {
    btn.textContent = '🔊';
    btn.classList.remove('muted');
    if (state.currentScreen >= 3) startVoice(state.currentScreen);
  } else {
    btn.textContent = '🔇';
    btn.classList.add('muted');
    stopVoice();
  }
});

/* ═══════════════════════════════════════════════════════════
   Boot
════════════════════════════════════════════════════════════ */
bindOptions();
startTimer();
