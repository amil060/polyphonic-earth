// 🌃 Night Lights 2012 → 2023 — VIIRS Black Marble (NASA SVS #5313)
/* global Tone */
import { SCALES, quantize, midiToNote, panOf, clamp01 } from '../engine.js';

// Map starts near 160°W, so x → longitude = -160 + x·360
function regionOf(x) {
  const lon = -160 + x * 360;
  if (lon < -30) return 'the Americas';
  if (lon < 60) return 'Europe, Africa and the Middle East';
  if (lon < 100) return 'South Asia';
  return 'East Asia and Oceania';
}

export const YEARS =[2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 'change'];

export const nightlights = {
  id: 'nightlights',
  key: '2',
  title: 'Night Lights 2012 → 2023',
  short: 'Night Lights',
  icon: 'moon',
  accent: '#fbbf24',
  subtitle: 'VIIRS Black Marble: human-made light seen from orbit, year by year.',
  media: { type: 'image', src: (y) => `assets/data/nightlights/${y}.jpg` },
  geo: { lon0: -160, latTop: 90, latBottom: -90 },
  credit: {
    text: 'NASA/Goddard Space Flight Center Scientific Visualization Studio: "Change in Night Lights between 2012 and 2023 – EIC Version" (VIIRS Black Marble)',
    url: 'https://svs.gsfc.nasa.gov/5313/',
  },
  probeScale: SCALES.lydian,
  probeBase: 55,
  bpm: 88,
  mode: 'year',
  baseline: null, // light energy of 2012, measured at load
  legend: [
    { ico: 'bell', title: 'Bells: cities', text: 'Each slice of the map rings bells for its city lights. More light gives more bells. Northern cities ring higher.' },
    { ico: 'headphones', title: 'Stereo: longitude', text: 'The Americas are on your left, Europe and Africa in the middle, Asia on your right.' },
    { ico: 'trend', title: 'Bass drone: global growth', text: 'The drone climbs as the world gets brighter compared with 2012.' },
    { ico: 'history', title: 'Change mode', text: 'Rising chimes mark places that grew brighter (purple). Falling low tones mark places that went darker (orange).' },
  ],

  value(r, g, b) {
    // Calibrated on the actual SVS frames: city lights are dim warm pixels (e.g. 37,36,18)
    // on a near-black map; grey land/ice has r ≈ b and is ignored.
    const mx = Math.max(r, g, b);
    if (this.mode === 'change') {
      const mag = clamp01((mx - 25) / 90);
      if (mx >= 30 && b > r + 8 && b > g + 8) return 0.5 + 0.5 * mag;  // purple: brighter now
      if (mx >= 35 && r > b + 25 && r > g + 8) return 0.5 - 0.5 * mag; // orange: darker now
      return null;
    }
    if (mx < 28 || r - b < 12) return null;
    return clamp01((mx - 25) / 120);
  },

  label(v) {
    if (this.mode === 'change') {
      if (v == null) return 'no light';
      if (v > 0.58) return 'brighter than in 2012';
      if (v < 0.42) return 'darker than in 2012';
      return 'about the same as 2012';
    }
    if (v == null) return 'dark, few people';
    if (v < 0.25) return 'faint lights, towns';
    if (v < 0.55) return 'city lights';
    return 'bright metropolitan area';
  },

  build(engine) {
    const n = (this.nodes = {});
    n.pan = new Tone.Panner(0).connect(engine.bus);
    n.bell = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.01, modulationIndex: 6,
      envelope: { attack: 0.002, decay: 0.7, sustain: 0, release: 0.9 },
      modulationEnvelope: { attack: 0.002, decay: 0.3, sustain: 0, release: 0.4 },
      volume: -17,
    }).connect(n.pan);
    n.drone = new Tone.Synth({
      oscillator: { type: 'fatsine', count: 2, spread: 10 },
      envelope: { attack: 1.5, decay: 0.5, sustain: 0.8, release: 2 },
      volume: -20,
    }).connect(engine.bus);
    n.fall = new Tone.MonoSynth({
      oscillator: { type: 'sine' }, portamento: 0.25,
      envelope: { attack: 0.02, decay: 0.4, sustain: 0.2, release: 0.6 },
      filterEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.5, baseFrequency: 300, octaves: 2 },
      volume: -12,
    }).connect(n.pan);
  },

  growth(stats) {
    if (!this.baseline) return 1;
    return stats.energy / this.baseline;
  },

  onBar(stats, time) {
    const g = this.growth(stats);
    const v = this.mode === 'change' ? 0.5 : clamp01((g - 0.9) / 0.4);
    this.nodes.drone.triggerAttackRelease(midiToNote(quantize(v, SCALES.majorPent, 33, 1)), '1m', time, 0.6);
  },

  onStep(col, time) {
    const { pan, bell, fall } = this.nodes;
    pan.pan.setValueAtTime(panOf(col.x), time);
    if (this.mode === 'change') {
      if (col.coverage < 0.004) return;
      if (col.mean > 0.55) {
        const m = quantize(0.6 + (col.mean - 0.5), SCALES.lydian, 67, 1);
        bell.triggerAttackRelease([midiToNote(m)], '16n', time, 0.6);
        bell.triggerAttackRelease([midiToNote(m + 7)], '16n', time + Tone.Time('32n').toSeconds(), 0.5);
        return 0.8;
      } else if (col.mean < 0.45) {
        fall.triggerAttackRelease('C3', '8n', time, 0.7);
        fall.setNote('G2', time + 0.08);
        return 0.6;
      }
      return 0;
    }
    if (col.coverage < 0.003) return;
    const count = 1 + (col.coverage > 0.015) + (col.coverage > 0.04);
    const base = quantize(clamp01(1 - col.lat * 1.3 + 0.2), SCALES.majorPent, 64, 2);
    const step = Tone.Time('32n').toSeconds();
    const vel = 0.3 + clamp01(col.coverage * 12) * 0.6;
    for (let k = 0; k < count; k++) {
      bell.triggerAttackRelease([midiToNote(base + [0, 4, 7][k])], '16n', time + k * step, vel);
    }
    return vel;
  },

  describe(stats, cols, ctx) {
    if (this.mode === 'change') {
      const up = cols.filter((c) => c.mean > 0.55 && c.coverage > 0.004).length;
      const down = cols.filter((c) => c.mean < 0.45 && c.coverage > 0.004).length;
      const lit = cols.filter((c) => c.coverage > 0.004);
      const most = (f) => lit.length ? [...lit].sort(f)[0] : null;
      const brightest = most((a, b) => b.mean - a.mean);
      const darkest = most((a, b) => a.mean - b.mean);
      return `Change from 2012 to 2023. ${up} of 16 map slices are mostly brighter (rising chimes) and ${down} are mostly darker (falling tones). ` +
        (brightest ? `The strongest brightening is over ${regionOf(brightest.x)}` : '') +
        (darkest && darkest.mean < 0.5 ? `, the strongest dimming over ${regionOf(darkest.x)}.` : '.');
    }
    const g = Math.round((this.growth(stats) - 1) * 100);
    const top = [...cols].sort((a, b) => b.energy - a.energy)[0];
    const region = regionOf(top.x);
    return `Year ${ctx.year}. Total detected light is ${g >= 0 ? g + '% above' : -g + '% below'} 2012, ` +
      `so the bass drone is ${g > 5 ? 'higher' : 'near its starting note'}. The busiest bells are over ${region}.`;
  },

  dispose() { Object.values(this.nodes || {}).forEach((x) => x.dispose()); this.nodes = null; },
};
