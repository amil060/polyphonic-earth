// Night Lights 2012 → 2023 — VIIRS Black Marble (NASA SVS #5313)
/* global Tone */
import { MAQAM, micro, microChord, panOf, clamp01 } from '../engine.js';

// Map starts near 160°W, so x → longitude = -160 + x·360
function regionOf(x) {
  const lon = -160 + x * 360;
  if (lon < -30) return 'the Americas';
  if (lon < 60) return 'Europe, Africa and the Middle East';
  if (lon < 100) return 'South Asia';
  return 'East Asia and Oceania';
}

export const YEARS = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 'change'];

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
  scale: MAQAM.rast,
  base: 60,
  bpm: 72,
  refLabels: ['a dark region', 'a bright city'],
  mode: 'year',
  baseline: null, // light energy of 2012, measured at load
  layers: [
    { id: 'melody', label: 'Bells' },
    { id: 'harmony', label: 'Harmony' },
    { id: 'bass', label: 'Drone' },
    { id: 'texture', label: 'City hum' },
  ],
  legend: [
    { ico: 'bell', title: 'Bells: cities', text: 'Each slice of the map rings a glass bell for its city lights. Brighter cities ring louder and higher.' },
    { ico: 'headphones', title: 'Stereo: longitude', text: 'The Americas are on your left, Europe and Africa in the middle, Asia on your right.' },
    { ico: 'trend', title: 'Drone: global growth', text: 'The drone and harmony climb as the world gets brighter compared with 2012.' },
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
    n.bell = new Tone.PolySynth(Tone.FMSynth, { maxPolyphony: 8,
      harmonicity: 3.01, modulationIndex: 4,
      envelope: { attack: 0.004, decay: 1.6, sustain: 0, release: 3 },
      modulationEnvelope: { attack: 0.004, decay: 0.6, sustain: 0, release: 1.5 },
      volume: -9,
    }).connect(n.pan);
    n.padFilter = new Tone.Filter(1800, 'lowpass').connect(engine.bus);
    n.pad = new Tone.PolySynth(Tone.AMSynth, {
      envelope: { attack: 2.5, decay: 1, sustain: 0.8, release: 5 },
      volume: -26,
    }).connect(n.padFilter);
    n.drone = new Tone.PolySynth(Tone.Synth, { maxPolyphony: 3,
      oscillator: { type: 'fatsine', count: 2, spread: 8 },
      envelope: { attack: 2, decay: 0.5, sustain: 0.9, release: 4 },
      volume: -28,
    }).connect(engine.bus);
    n.fall = new Tone.MonoSynth({
      oscillator: { type: 'sine' }, portamento: 0.4,
      envelope: { attack: 0.05, decay: 0.6, sustain: 0.3, release: 1.5 },
      filterEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.5, baseFrequency: 300, octaves: 2 },
      volume: -12,
    }).connect(n.pan);
    n.humGain = new Tone.Gain(0).connect(engine.bus);
    n.humFilter = new Tone.Filter({ type: 'bandpass', frequency: 2600, Q: 1.2 }).connect(n.humGain);
    n.hum = new Tone.Noise('pink').connect(n.humFilter).start();
  },

  growth(stats) {
    if (!this.baseline) return 1;
    return stats.energy / this.baseline;
  },

  reference(v, time) {
    this.nodes.pan.pan.rampTo(0, 0.06, time);
    this.nodes.bell.triggerAttackRelease([micro(v, this.scale, this.base)], '4n', time, 0.3 + v * 0.6);
  },

  onBar(stats, time, on) {
    const n = this.nodes;
    const g = this.growth(stats);
    const v = this.mode === 'change' ? 0.5 : clamp01((g - 0.9) / 0.6);
    const root = Math.round(v * 6);
    if (on('harmony')) n.pad.triggerAttackRelease(microChord(root, [0, 2, 4], this.scale, 48), '1m', time, 0.5);
    if (on('bass')) n.drone.triggerAttackRelease(microChord(root, [0], this.scale, 36)[0], '1m', time, 0.6);
    n.humGain.gain.rampTo(on('texture') ? clamp01(stats.coverage * 8) * 0.08 : 0, 2, time);
  },

  onStep(col, time, on) {
    if (!on('melody')) return 0;
    const { pan, bell, fall } = this.nodes;
    pan.pan.rampTo(panOf(col.x), 0.06, time);
    if (this.mode === 'change') {
      if (col.coverage < 0.004) return 0;
      if (col.mean > 0.55) {
        const f = micro(0.55 + (col.mean - 0.5), MAQAM.rast, 67, 1);
        bell.triggerAttackRelease([f], '8n', time, 0.6);
        bell.triggerAttackRelease([f * 1.5], '8n', time + Tone.Time('16n').toSeconds(), 0.5);
        return 0.8;
      }
      if (col.mean < 0.45) {
        fall.triggerAttackRelease(micro(0.4, MAQAM.saba, 48, 1), '4n', time, 0.7);
        fall.setNote(micro(0.05, MAQAM.saba, 48, 1), time + 0.1);
        return 0.6;
      }
      return 0;
    }
    if (col.coverage < 0.003) return 0;
    const bright = clamp01(Math.sqrt(col.coverage * 25)); // spread the few lit pixels over the whole range
    const vel = 0.3 + bright * 0.6;
    bell.triggerAttackRelease([micro(bright, this.scale, this.base)], '8n', time, vel);
    return vel;
  },

  describe(stats, cols, ctx) {
    if (this.mode === 'change') {
      const up = cols.filter((c) => c.mean > 0.55 && c.coverage > 0.004).length;
      const down = cols.filter((c) => c.mean < 0.45 && c.coverage > 0.004).length;
      const lit = cols.filter((c) => c.coverage > 0.004);
      const most = (f) => (lit.length ? [...lit].sort(f)[0] : null);
      const brightest = most((a, b) => b.mean - a.mean);
      const darkest = most((a, b) => a.mean - b.mean);
      return `Change from 2012 to 2023. ${up} of ${cols.length} map slices are mostly brighter (rising chimes) and ${down} are mostly darker (falling tones). ` +
        (brightest ? `The strongest brightening is over ${regionOf(brightest.x)}` : '') +
        (darkest && darkest.mean < 0.5 ? `, the strongest dimming over ${regionOf(darkest.x)}.` : '.');
    }
    const g = Math.round((this.growth(stats) - 1) * 100);
    const top = [...cols].sort((a, b) => b.energy - a.energy)[0];
    return `Year ${ctx.year}. Total detected light is ${g >= 0 ? g + '% above' : -g + '% below'} 2012, ` +
      `so the drone is ${g > 5 ? 'higher' : 'near its starting note'}. The loudest bells are over ${regionOf(top.x)}.`;
  },

  dispose() {
    if (this.nodes) this.nodes.hum.stop();
    Object.values(this.nodes || {}).forEach((x) => x.dispose());
    this.nodes = null;
  },
};
