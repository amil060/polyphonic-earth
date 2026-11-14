// Polyphonic Earth — app controller: scenes, jukebox transport, Listen by Touch, accessibility.
/* global Tone */
import { Analyzer } from './analyzer.js';
import { Engine, clamp01 } from './engine.js';
import { ocean } from './scenes/ocean.js';
import { nightlights, YEARS } from './scenes/nightlights.js';
import { lightning } from './scenes/lightning.js';
import { co2 } from './scenes/co2.js';
import { icon } from './icons.js';

const SCENES = [ocean, nightlights, lightning, co2];
const STEPS = 8; // slices per sweep: fewer, longer notes are easier to follow by ear

const $ = (id) => document.getElementById(id);
const el = {
  intro: $('intro'), start: $('start'), tabs: $('scene-tabs'),
  title: $('scene-title'), sub: $('scene-sub'), stage: $('stage'),
  video: $('video'), still: $('still'), overlay: $('overlay'), badge: $('touch-badge'),
  play: $('play'), touch: $('touch'), describe: $('describe'), volume: $('volume'),
  legend: $('legend'), live: $('live'), probeLive: $('probe-live'), credit: $('credit'),
  readoutLabel: $('readout-label'), readoutValue: $('readout-value'),
  tm: $('timeline'), year: $('year'), yearOut: $('year-out'), autoyear: $('autoyear'),
  yearPrev: $('year-prev'), yearNext: $('year-next'), ticks: $('ticks'),
  spark: $('sparkline'), sparkWrap: $('spark-wrap'), help: $('help'),
  frame: $('frame'), liveDot: $('live-dot'),
};

const engine = new Engine();
const analyzer = new Analyzer();
const state = {
  scene: null, playing: false, touch: false,
  cols: [], stats: { mean: 0, coverage: 0, energy: 0, motion: 0, north: 0, south: 0 },
  step: -1, bar: 0, yearIndex: 0,
  cursor: { x: 0.5, y: 0.5, visible: false },
  lastProbe: 0, lastAnnounce: 0, loop: null,
  yearEnergy: null,
};

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Scene tabs ----------
SCENES.forEach((s, i) => {
  const li = document.createElement('li');
  li.setAttribute('role', 'presentation');
  const b = document.createElement('button');
  b.className = 'tab';
  b.type = 'button';
  b.id = `tab-${s.id}`;
  b.setAttribute('role', 'tab');
  b.setAttribute('aria-selected', 'false');
  b.setAttribute('aria-controls', 'stage');
  b.style.setProperty('--tab-accent', s.accent);
  b.innerHTML = `<span class="tab-mark" aria-hidden="true"></span>${icon(s.icon)}<span class="tab-label">${s.short}</span><kbd class="num" aria-hidden="true">${s.key}</kbd>`;
  b.addEventListener('click', () => selectScene(i));
  b.addEventListener('keydown', (e) => {
    const fwd = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    if (fwd || back) {
      e.preventDefault();
      e.stopPropagation();
      const j = (i + (fwd ? 1 : SCENES.length - 1)) % SCENES.length;
      selectScene(j);
      $(`tab-${SCENES[j].id}`).focus();
    }
  });
  li.appendChild(b);
  el.tabs.appendChild(li);
});

// ---------- Media ----------
function currentMedia() {
  return state.scene?.media.type === 'video' ? el.video : el.still;
}

function showYear(i) {
  state.yearIndex = (i + YEARS.length) % YEARS.length;
  const y = YEARS[state.yearIndex];
  nightlights.mode = y === 'change' ? 'change' : 'year';
  el.still.src = nightlights.media.src(y);
  el.year.value = String(2012 + state.yearIndex);
  const label = y === 'change' ? 'Change 2012→2023' : String(y);
  if (state.scene === nightlights) applyScale();
  el.yearOut.textContent = y === 'change' ? 'Change' : label;
  el.yearOut.classList.toggle('change', y === 'change');
  el.year.setAttribute('aria-valuetext', label);
  [...el.ticks.children].forEach((b, i) => b.setAttribute('aria-current', String(i === state.yearIndex)));
}

// Clickable year ticks under the timeline (mouse shortcut; the range input is the keyboard control)
YEARS.forEach((y, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.tabIndex = -1;
  b.textContent = y === 'change' ? 'Δ' : `'${String(y).slice(2)}`;
  b.title = y === 'change' ? 'Change 2012→2023' : String(y);
  b.addEventListener('click', () => showYear(i));
  el.ticks.appendChild(b);
});

async function measureYears() {
  if (state.yearEnergy) return;
  const a = new Analyzer();
  const energies = [];
  const prevMode = nightlights.mode;
  nightlights.mode = 'year';
  for (const y of YEARS.slice(0, -1)) {
    const img = new Image();
    img.src = nightlights.media.src(y);
    await img.decode();
    a.capture(img, nightlights);
    energies.push(a.stats().energy);
  }
  nightlights.mode = prevMode;
  state.yearEnergy = energies;
  nightlights.baseline = energies[0];
  drawSparkline(energies);
}

function drawSparkline(values) {
  const W = 300, H = 70, P = 8;
  const min = Math.min(...values), max = Math.max(...values);
  const xs = (i) => P + (i / (values.length - 1)) * (W - 2 * P);
  const ys = (v) => H - P - ((v - min) / (max - min || 1)) * (H - 2 * P - 12);
  const pts = values.map((v, i) => `${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(' ');
  const change = Math.round((values.at(-1) / values[0] - 1) * 100);
  el.spark.innerHTML =
    `<polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>` +
    values.map((v, i) => `<circle cx="${xs(i)}" cy="${ys(v)}" r="2.8" fill="var(--accent)"/>`).join('') +
    `<text x="${P}" y="12" fill="#a8b6d6" font-size="11">2012</text>` +
    `<text x="${W - P}" y="12" fill="#a8b6d6" font-size="11" text-anchor="end">2023: ${change >= 0 ? '+' : ''}${change}%</text>`;
  el.spark.setAttribute('aria-label',
    `Line chart of total detected night light, 2012 to 2023. Light changed by ${change >= 0 ? '+' : ''}${change}% over the period.`);
}

// Let release tails finish before disposing, so scheduled note-offs never hit a disposed synth.
function retire(scene) {
  const nodes = scene.nodes;
  scene.nodes = null;
  Object.values(nodes).forEach((n) => {
    try { n.releaseAll?.(); } catch { /* ignore */ }
    try { if (n instanceof Tone.Noise) n.stop(); } catch { /* ignore */ }
  });
  setTimeout(() => Object.values(nodes).forEach((n) => { try { n.dispose(); } catch { /* ignore */ } }), 8000);
}

// ---------- Scene selection ----------
async function selectScene(i) {
  const s = SCENES[i];
  if (state.scene === s) return;
  const wasPlaying = state.playing;
  if (state.playing) pause();
  if (state.scene?.nodes) retire(state.scene);
  state.scene = s;
  state.step = -1; state.bar = 0;
  state.needsIntro = true;

  document.documentElement.style.setProperty('--accent', s.accent);
  SCENES.forEach((x) => $(`tab-${x.id}`).setAttribute('aria-selected', String(x === s)));
  textEffect(el.title, s.title);
  requestAnimationFrame(moveGlider);
  el.sub.textContent = s.subtitle;
  el.credit.innerHTML = `${s.credit.text}. <a href="${s.credit.url}" target="_blank" rel="noopener">${s.credit.url.replace('https://', '')}</a>`;
  el.legend.innerHTML = s.legend.map((l) =>
    `<li><span class="ico">${icon(l.ico)}</span><div><b>${l.title}</b><span>${l.text}</span></div></li>`).join('');

  el.tm.hidden = s !== nightlights;
  el.sparkWrap.hidden = s !== nightlights;
  applyScale();
  hideCallout();
  $('scene-listen').textContent = LISTEN[s.id];
  el.readoutValue.textContent = '—';
  state.layers = new Set();
  renderLayers();
  el.frame.style.setProperty('--ar', s === ocean || s === lightning ? '2' : String(16 / 9));
  if (s.media.type === 'video') {
    el.still.hidden = true; el.video.hidden = false;
    el.video.src = s.media.src;
  } else {
    el.video.pause(); el.video.removeAttribute('src'); el.video.load();
    el.video.hidden = true; el.still.hidden = false;
    showYear(state.yearIndex);
    measureYears();
  }
  analyzer.ready = false;
  if (engine.started) {
    s.build(engine);
    Tone.getContext().transport.bpm.value = s.bpm;
  }
  setLive(`${s.title}. ${s.subtitle} ${wasPlaying ? 'Playing now.' : 'Press Space to play.'}`);
  if (wasPlaying) play();
}

// ---------- Analysis loop (10 Hz) ----------
setInterval(() => {
  const s = state.scene;
  if (!s) return;
  const m = currentMedia();
  const ok = m === el.video ? m.readyState >= 2 : m.complete && m.naturalWidth > 0;
  if (!ok) return;
  if (analyzer.capture(m, s)) {
    state.cols = analyzer.columns(STEPS);
    state.stats = analyzer.stats();
    if (!state.touch) updateReadout();
  }
}, 100);

// ---------- Colour → sound legend ----------
const SCALE_UI = { // gradients run top (high value) → bottom (low value), sampled from each NASA colour scale
  ocean: { grad: ['#e0251e', '#f08a1e', '#e8e23a', '#2ee06a', '#1fa3e0', '#2b2bd9'], top: ['Warm water', 'high notes'], bottom: ['Cold water', 'low notes'] },
  nightlights: { grad: ['#fff3c4', '#c9a640', '#5a4a1a', '#0b0b0b'], top: ['Bright cities', 'more, louder bells'], bottom: ['Dark', 'silence'] },
  change: { grad: ['#a855f7', '#e9d5ff', '#ffffff', '#fdba74', '#f97316'], top: ['Brighter', 'rising chimes'], bottom: ['Darker', 'falling tones'] },
  lightning: { grad: ['#e9f04a', '#8f9a28', '#3a3a3a'], top: ['Many flashes', 'hard drum hits'], bottom: ['No flashes', 'silence'] },
  co2: { grad: ['#e11d1d', '#e8651e', '#e6a04a', '#d8c08a'], top: ['High CO₂', 'tense, bright'], bottom: ['Background', 'calm'] },
};
function applyScale() {
  const s = state.scene;
  const ui = SCALE_UI[s === nightlights && nightlights.mode === 'change' ? 'change' : s.id];
  $('scale-bar').style.setProperty('--scale-grad', `linear-gradient(${ui.grad.join(', ')})`);
  $('scale-top').innerHTML = `<b>${ui.top[0]}</b>${ui.top[1]}`;
  $('scale-bottom').innerHTML = `<b>${ui.bottom[0]}</b>${ui.bottom[1]}`;
}
// One plain line per scene: what the sound means. Shown under the title and after the sound legend.
const LISTEN = {
  ocean: 'High note = warm water · low note = cold water · soft knock = land · left ear = west',
  nightlights: 'Louder, higher bell = brighter city · the drone rises as the world gets brighter · left ear = the Americas',
  lightning: 'Each drum hit = lightning · deep boom = tropical storm · higher drum = far from the equator',
  co2: 'Higher note = more CO₂ · the chord shimmers and beats as CO₂ rises · rumble = how much is covered',
};

function showCallout(kind) {
  const s = state.scene;
  const box = $('callout');
  const ui = SCALE_UI[s === nightlights && nightlights.mode === 'change' ? 'change' : s.id];
  const set = (step, title, meaning, chip, level) => {
    $('callout-step').textContent = step;
    $('callout-title').textContent = title;
    $('callout-meaning').textContent = meaning;
    $('callout-chip').style.setProperty('--chip', chip);
    $('callout-bar').parentElement.style.setProperty('--level', level);
  };
  if (kind === 'low') set('Sound legend · 1 of 2', 'Lowest note', `means ${s.refLabels[0]}`, ui.grad[ui.grad.length - 1], '6%');
  else if (kind === 'high') set('Sound legend · 2 of 2', 'Highest note', `means ${s.refLabels[1]}`, ui.grad[0], '100%');
  else set('Now listen', 'The sweep plays west → east', LISTEN[s.id], s.accent, '50%');
  box.hidden = false;
  box.classList.remove('enter'); void box.offsetWidth; box.classList.add('enter');
  $('scale').classList.toggle('focus', kind !== 'go');
}
function hideCallout() {
  $('callout').hidden = true;
  $('scale').classList.remove('focus');
}

function setMark(v) {
  const m = $('scale-mark');
  m.hidden = v == null;
  if (v != null) m.style.top = `calc(${((1 - clamp01(v)) * 100).toFixed(1)}% - 1.5px)`;
}

function updateReadout() {
  const s = state.scene;
  if (state.refStep < REF_STEPS) return; // the sound legend owns the marker for one bar
  setMark(s === lightning ? clamp01(state.stats.coverage * 40) : state.stats.coverage > 0 ? state.stats.mean : null);
  if (s === nightlights && nightlights.mode === 'year') {
    el.readoutLabel.textContent = 'Light vs 2012';
    const g = (nightlights.growth(state.stats) - 1) * 100;
    tween('readout', g, (v) => { const r = Math.round(v); el.readoutValue.textContent = `${r >= 0 ? '+' : ''}${r}%`; });
  } else if (s === lightning) {
    el.readoutLabel.textContent = 'Now playing';
    tween('readout', state.stats.coverage * 100, (v) => { el.readoutValue.textContent = `${v.toFixed(1)}% flashing`; });
  } else {
    el.readoutLabel.textContent = 'Now playing';
    el.readoutValue.textContent = s.label(state.stats.mean);
  }
}

// ---------- Transport ----------
function ensureLoop() {
  if (state.loop) return;
  state.loop = new Tone.Loop((time) => {
    const s = state.scene;
    if (!s?.nodes || !analyzer.ready) return;

    // Sound legend: before the music, play the lowest and the highest value once,
    // like the axis of a chart, while the scale marker shows where each sits.
    if (state.refStep < REF_STEPS) {
      const k = state.refStep++;
      if (k === 0) {
        s.reference(0, time);
        Tone.getContext().draw.schedule(() => { setMark(0); showCallout('low'); setLive(`Sound legend. This low note is ${s.refLabels[0]}.`); }, time);
      } else if (k === 4) {
        s.reference(1, time);
        Tone.getContext().draw.schedule(() => { setMark(1); showCallout('high'); setLive(`This high note is ${s.refLabels[1]}. Now the map plays, one layer at a time.`); }, time);
      }
      return;
    }

    state.step = (state.step + 1) % STEPS;
    if (state.step === 0) {
      state.bar++;
      if (state.bar === 1) Tone.getContext().draw.schedule(() => showCallout('go'), time);
      if (state.bar === 3) Tone.getContext().draw.schedule(hideCallout, time);
      // Layers enter one at a time: melody alone, then harmony, bass and texture every two bars.
      if (!state.layerManual) {
        const want = Math.min(s.layers.length, 1 + Math.floor((state.bar - 1) / 2));
        const before = state.layers.size;
        s.layers.slice(0, want).forEach((l) => state.layers.add(l.id));
        if (state.layers.size !== before) {
          const added = s.layers[want - 1].label;
          Tone.getContext().draw.schedule(() => { renderLayers(); el.probeLive.textContent = `${added} joins.`; }, time);
        }
      }
      s.onBar(state.stats, time, layerOn);
      if (s === nightlights && el.autoyear.checked && state.bar % 2 === 0) {
        Tone.getContext().draw.schedule(() => showYear(state.yearIndex + 1), time);
      }
      if (state.bar % 8 === 1) Tone.getContext().draw.schedule(() => describeNow(), time);
    }
    const col = state.cols[state.step];
    const hit = col ? s.onStep(col, time, layerOn, engine) : 0;
    Tone.getContext().draw.schedule(() => {
      if (hit) addRipple(col.x, col.lat, hit, col);
      pushTrace(hit || 0);
      drawTrace();
    }, time);
    const step = state.step;
    Tone.getContext().draw.schedule(() => { state.drawStep = step; }, time);
  }, '8n').start(0);
}

// ---------- Layers ----------
const REF_STEPS = 8; // one bar of sound legend: low note on step 0, high note on step 4
state.layers = new Set();
state.refStep = REF_STEPS;
state.needsIntro = true;
state.layerManual = false;
const layerOn = (id) => state.layers.has(id);

function startIntro() {
  state.refStep = 0;
  state.step = -1;
  state.bar = 0;
  state.layerManual = false;
  state.layers = new Set();
  renderLayers();
}

function renderLayers() {
  const box = $('layers');
  const s = state.scene;
  if (!box || !s) return;
  box.innerHTML = '<span class="layers-label" aria-hidden="true">Layers</span>' + s.layers.map((l) =>
    `<button type="button" class="chip" data-layer="${l.id}" aria-pressed="${state.layers.has(l.id)}">${l.label}</button>`).join('');
}
$('layers')?.addEventListener('click', (e) => {
  const b = e.target.closest('[data-layer]');
  if (!b) return;
  const id = b.dataset.layer;
  state.layerManual = true;
  if (state.layers.has(id)) state.layers.delete(id); else state.layers.add(id);
  b.setAttribute('aria-pressed', String(state.layers.has(id)));
});

function play() {
  if (!engine.started || !state.scene) return;
  // Phones suspend audio when the screen locks or the tab is hidden; a tap on Play wakes it.
  if (Tone.getContext().state !== 'running') Tone.getContext().resume().catch(() => {});
  if (!state.scene.nodes) state.scene.build(engine);
  if (state.needsIntro) { startIntro(); state.needsIntro = false; }
  ensureLoop();
  Tone.getContext().transport.start('+0.05');
  if (state.scene.media.type === 'video') el.video.play().catch(() => {});
  state.playing = true;
  state.playStart = performance.now();
  state.noteTimes = [];
  el.liveDot.classList.add('on');
  el.play.setAttribute('aria-pressed', 'true');
  el.play.querySelector('span').textContent = 'Pause';
}

function pause() {
  Tone.getContext().transport.pause();
  el.video.pause();
  state.playing = false;
  state.drawStep = undefined;
  el.liveDot.classList.remove('on');
  el.play.setAttribute('aria-pressed', 'false');
  el.play.querySelector('span').textContent = 'Play';
}

const togglePlay = () => (state.playing ? pause() : play());

// ---------- Descriptions ----------
function setLive(text) { el.live.textContent = text; }
function describeNow() {
  const s = state.scene;
  if (!s || !state.cols.length) return;
  setLive(s.describe(state.stats, state.cols, { year: YEARS[state.yearIndex] }));
}

// ---------- Listen by Touch ----------
function setTouch(on) {
  state.touch = on;
  el.touch.setAttribute('aria-pressed', String(on));
  el.badge.hidden = !on;
  el.stage.classList.toggle('touching', on);
  state.cursor.visible = on;
  if (engine.started) engine.bus.gain.rampTo(on ? 0.3 : 1, 0.3); // duck the music while exploring
  if (on) {
    el.stage.focus({ preventScroll: true });
    setLive('Listen by Touch is on. Move the mouse or your finger over the map, or use the arrow keys. High pitch means a high value. Silence with a soft tick means no data.');
    probe(true);
  } else {
    setLive('Listen by Touch is off.');
  }
}

function geoText(s, fx, fy) {
  if (!s.geo) return '';
  const lat = s.geo.latTop - fy * (s.geo.latTop - s.geo.latBottom);
  let lon = s.geo.lon0 + fx * 360;
  lon = ((lon + 540) % 360) - 180;
  const la = `${Math.abs(Math.round(lat))}°${lat >= 0 ? 'N' : 'S'}`;
  const lo = `${Math.abs(Math.round(lon))}°${lon >= 0 ? 'E' : 'W'}`;
  return `about ${la}, ${lo}: `;
}

function probe(force = false) {
  const s = state.scene;
  if (!s || !analyzer.ready) return;
  const now = performance.now();
  if (!force && now - state.lastProbe < 70) return;
  state.lastProbe = now;
  const { x, y } = state.cursor;
  const v = analyzer.valueAt(x, y);
  engine.playProbe(v, x, s);
  setMark(v);
  const text = `${geoText(s, x, y)}${s.label(v)}${v == null ? '' : `, ${Math.round(v * 100)}%`}`;
  el.readoutLabel.textContent = 'Under cursor';
  el.readoutValue.textContent = v == null ? '—' : `${Math.round(v * 100)}%`;
  if (force || now - state.lastAnnounce > 600) {
    state.lastAnnounce = now;
    el.probeLive.textContent = text;
  }
}

el.stage.addEventListener('pointermove', (e) => {
  if (!state.touch) return;
  const r = el.stage.getBoundingClientRect();
  state.cursor.x = clamp01((e.clientX - r.left) / r.width);
  state.cursor.y = clamp01((e.clientY - r.top) / r.height);
  probe();
});
el.stage.addEventListener('pointerdown', (e) => {
  if (!state.touch) return;
  el.stage.setPointerCapture?.(e.pointerId);
});

// ---------- Ripples + notes-per-minute ----------
const RIPPLE_MS = 1400;
state.ripples = [];
state.noteTimes = [];
function addRipple(x, y, str, col) {
  const now = performance.now();
  if (col) logNote(col, str, now);
  state.ripples.push({ x, y: clamp01(y), str: clamp01(str), t0: now });
  state.noteTimes.push(now);
  while (state.noteTimes.length && now - state.noteTimes[0] > 60000) state.noteTimes.shift();
  const span = Math.min(60000, now - (state.playStart || now)) || 1;
  const perMin = Math.round(state.noteTimes.length * (60000 / Math.max(span, 4000)));
  tween('npm', perMin, (v) => { $('npm').textContent = `${Math.round(v)} notes/min`; });
}

// ---------- Overlay drawing ----------
const octx = el.overlay.getContext('2d');
function draw() {
  const dpr = Math.min(2, devicePixelRatio || 1);
  const W = el.overlay.clientWidth, H = el.overlay.clientHeight;
  if (el.overlay.width !== Math.round(W * dpr)) { el.overlay.width = Math.round(W * dpr); el.overlay.height = Math.round(H * dpr); }
  octx.setTransform(dpr, 0, 0, dpr, 0, 0);
  octx.clearRect(0, 0, W, H);
  const accent = state.scene?.accent || '#67e8f9';

  // data bars along the bottom: what each slice "weighs" musically
  if (state.cols.length) {
    const bw = W / STEPS;
    const maxE = Math.max(1e-6, ...state.cols.map((c) => c.coverage * (0.3 + c.mean)));
    state.cols.forEach((c, i) => {
      const h = (c.coverage * (0.3 + c.mean)) / maxE * H * 0.12;
      octx.fillStyle = i === state.drawStep ? accent : '#ffffff24';
      octx.fillRect(i * bw + 2, H - h, bw - 4, h);
    });
  }

  // sweep band
  if (state.playing && state.drawStep !== undefined) {
    const bw = W / STEPS;
    const x = state.drawStep * bw;
    const g = octx.createLinearGradient(x, 0, x + bw, 0);
    g.addColorStop(0, accent + '00'); g.addColorStop(0.5, accent + (reducedMotion ? '22' : '44')); g.addColorStop(1, accent + '00');
    octx.fillStyle = g;
    octx.fillRect(x, 0, bw, H);
    octx.fillStyle = accent;
    octx.fillRect(x + bw / 2 - 1, 0, 2, H);
  }

  // ripples: every note leaves a fading ring where its data came from
  const now = performance.now();
  state.ripples = state.ripples.filter((r) => now - r.t0 < RIPPLE_MS);
  for (const r of state.ripples) {
    const age = (now - r.t0) / RIPPLE_MS;
    const radius = reducedMotion ? 6 + r.str * 8 : 4 + age * (18 + r.str * 46);
    octx.globalAlpha = (1 - age) * (0.35 + r.str * 0.6);
    octx.strokeStyle = accent;
    octx.lineWidth = reducedMotion ? 2 : 2.5 * (1 - age) + 0.5;
    octx.beginPath(); octx.arc(r.x * W, r.y * H, radius, 0, Math.PI * 2); octx.stroke();
    if (age < 0.25) { octx.fillStyle = '#ffffff'; octx.beginPath(); octx.arc(r.x * W, r.y * H, 2.5, 0, Math.PI * 2); octx.fill(); }
  }
  octx.globalAlpha = 1;

  // touch cursor
  if (state.touch && state.cursor.visible) {
    const cx = state.cursor.x * W, cy = state.cursor.y * H;
    octx.strokeStyle = '#ffffffcc'; octx.lineWidth = 1;
    octx.beginPath(); octx.moveTo(cx, 0); octx.lineTo(cx, H); octx.moveTo(0, cy); octx.lineTo(W, cy); octx.stroke();
    octx.strokeStyle = accent; octx.lineWidth = 3;
    octx.beginPath(); octx.arc(cx, cy, 14, 0, Math.PI * 2); octx.stroke();
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// ---------- Controls ----------
// "What is this?" reopens the start screen; once sound is running, its play button just closes it.
$('about-btn').addEventListener('click', () => {
  el.intro.hidden = false;
  $('intro-desc').textContent = engine.started ? 'Press play to go back to the map' : 'Press play to hear our planet change';
  el.start.focus();
});
el.start.addEventListener('click', async () => {
  if (engine.started) {
    Tone.getContext().resume().catch(() => {});
    el.intro.hidden = true;
    el.stage.focus({ preventScroll: true });
    if (!state.playing) play();
    return;
  }
  el.start.disabled = true;
  el.start.querySelector('.sr-only').textContent = 'Loading sounds';
  $('intro-desc').textContent = 'Loading sounds…';
  try {
    await engine.start();
  } catch (err) {
    el.start.disabled = false;
    $('intro-desc').textContent = 'Sound could not start on this device. Tap play again, or try another browser.';
    console.error(err);
    return;
  }
  el.start.disabled = false;
  if (Tone.getContext().state !== 'running') {
    $('intro-desc').textContent = 'Tap play once more to turn the sound on. On iPhone, also check the silent switch and volume.';
    try { await Tone.getContext().resume(); } catch { /* ignore */ }
    if (Tone.getContext().state !== 'running') return;
  }
  engine.setVolume(Number(el.volume.value));
  el.intro.hidden = true;
  if (!state.scene) await selectScene(0);
  else state.scene.build(engine);
  Tone.getContext().transport.bpm.value = state.scene.bpm;
  el.stage.focus({ preventScroll: true });
  play();
});

el.play.addEventListener('click', togglePlay);
el.touch.addEventListener('click', () => setTouch(!state.touch));
el.describe.addEventListener('click', describeNow);
el.volume.addEventListener('input', () => engine.setVolume(Number(el.volume.value)));
el.year.addEventListener('input', () => showYear(Number(el.year.value) - 2012));
$('help-btn').addEventListener('click', () => el.help.showModal());
el.yearPrev.addEventListener('click', () => showYear(state.yearIndex - 1));
el.yearNext.addEventListener('click', () => showYear(state.yearIndex + 1));

document.addEventListener('keydown', (e) => {
  if (!el.intro.hidden) {
    if (e.key === 'Escape' && engine.started) el.intro.hidden = true;
    return;
  }
  if (el.help.open) return;
  const tag = e.target.tagName;
  const inField = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
  const k = e.key;

  if (state.touch && e.target === el.stage && k.startsWith('Arrow')) {
    e.preventDefault();
    const d = e.shiftKey ? 1 / 8 : 1 / 48;
    if (k === 'ArrowLeft') state.cursor.x = clamp01(state.cursor.x - d);
    if (k === 'ArrowRight') state.cursor.x = clamp01(state.cursor.x + d);
    if (k === 'ArrowUp') state.cursor.y = clamp01(state.cursor.y - d);
    if (k === 'ArrowDown') state.cursor.y = clamp01(state.cursor.y + d);
    probe(true);
    return;
  }
  if (inField && k !== 'Escape') return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (k >= '1' && k <= String(SCENES.length)) { selectScene(Number(k) - 1); return; }
  if (k === ' ' && tag !== 'BUTTON' && tag !== 'SUMMARY') { e.preventDefault(); togglePlay(); return; }
  switch (k.toLowerCase()) {
    case 't': setTouch(!state.touch); break;
    case 'd': describeNow(); break;
    case 'h': case '?': el.help.showModal(); break;
    case '[': if (state.scene === nightlights) showYear(state.yearIndex - 1); break;
    case ']': if (state.scene === nightlights) showYear(state.yearIndex + 1); break;
    case '-': el.volume.value = String(Math.max(0, Number(el.volume.value) - 10)); engine.setVolume(Number(el.volume.value)); break;
    case '=': case '+': el.volume.value = String(Math.min(100, Number(el.volume.value) + 10)); engine.setVolume(Number(el.volume.value)); break;
    case 'escape': if (state.touch) setTouch(false); break;
    default: break;
  }
});

// ---------- Motion Primitives–style helpers (vanilla ports) ----------
// Scene title: one short fade and rise when the scene changes, no per-word blur.
function textEffect(node, text) {
  node.textContent = text;
  if (reducedMotion) return;
  node.classList.remove('enter');
  void node.offsetWidth; // restart the animation
  node.classList.add('enter');
}

// Animated Number: values glide toward their target instead of jumping.
const tweens = {};
function tween(key, target, render) {
  const t = tweens[key] || (tweens[key] = { value: target, target, render, raf: 0 });
  t.target = target; t.render = render;
  if (reducedMotion) { t.value = target; render(target); return; }
  if (t.raf) return;
  const step = () => {
    t.value += (t.target - t.value) * 0.18;
    if (Math.abs(t.target - t.value) < 0.05) t.value = t.target;
    t.render(t.value);
    t.raf = t.value === t.target ? 0 : requestAnimationFrame(step);
  };
  t.raf = requestAnimationFrame(step);
}

// Watermelon-style glider behind the active scene pill.
function moveGlider() {
  const g = $('tab-glider');
  const tab = state.scene && $(`tab-${state.scene.id}`);
  if (!g || !tab) return;
  const nav = g.parentElement.getBoundingClientRect();
  const r = tab.getBoundingClientRect();
  g.style.width = `${r.width}px`;
  g.style.height = `${r.height}px`;
  g.style.transform = `translate(${r.left - nav.left}px, ${r.top - nav.top}px)`;
}
addEventListener('resize', moveGlider);

// ---------- Manus-style live log: every note with the data behind it ----------
function logNote(col, str, now) {
  const s = state.scene;
  const list = $('log');
  list.querySelector('.log-empty')?.remove();
  const secs = Math.max(0, Math.floor((now - (state.playStart || now)) / 1000));
  const t = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  let where = `slice ${col.index + 1}/16`;
  if (s.geo) {
    let lon = s.geo.lon0 + col.x * 360; lon = ((lon + 540) % 360) - 180;
    const lat = s.geo.latTop - col.lat * (s.geo.latTop - s.geo.latBottom);
    where = `${Math.abs(Math.round(lat))}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(Math.round(lon))}°${lon >= 0 ? 'E' : 'W'}`;
  }
  const li = document.createElement('li');
  li.innerHTML = `<span>${t}</span><span class="n">♪</span><span>${where} · ${s.label(col.mean)} · ${Math.round(str * 100)}%</span>`;
  list.prepend(li);
  while (list.children.length > 7) list.lastElementChild.remove();
}

// ---------- Oscilloscope trace: the last 64 sweep steps, drawn from the notes actually played ----------
// The signature: the same thin line as the map sweep. Each step is a sample; a played note
// is a spike whose height is its strength, a silent step stays on the baseline.
const TRACE_N = 64;
state.trace = new Array(TRACE_N).fill(0);
function pushTrace(v) { state.trace.push(v); state.trace.shift(); }
const traceSvg = $('waves');
traceSvg.innerHTML =
  '<line class="trace-base" x1="0" y1="60" x2="1440" y2="60"/>' +
  '<polyline class="trace-line" fill="none" points=""/>';
const tracePoly = traceSvg.querySelector('.trace-line');
function drawTrace() {
  const W = 1440, mid = 60, amp = 46;
  const pts = state.trace.map((v, i) => {
    const x = (i / (TRACE_N - 1)) * W;
    const y = mid - (i % 2 ? 1 : -1) * v * amp; // alternate sign so a note reads as an oscillation
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  tracePoly.setAttribute('points', pts.join(' '));
}
drawTrace();

// Show the first scene moving behind the start gate so the first screen is never empty.
selectScene(0).then(() => el.video.play().catch(() => {}));
el.start.focus();
