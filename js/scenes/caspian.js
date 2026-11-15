// Caspian & Mingachevir — 44 years of warming at home (NASA POWER + NASA GIBS MODIS imagery)
/* global Tone */
import { MAQAM, micro, microChord, clamp01 } from '../engine.js?v=20261115192303';
import { yearlySeries } from '../power.js?v=20261115192303';

const LAT = 40.76, LON = 47.05;              // Mingachevir, Azerbaijan
const BOX = { lonW: 43, lonE: 55, latN: 48, latS: 36 }; // the satellite image bounds
const PX = { x: (LON - BOX.lonW) / (BOX.lonE - BOX.lonW), y: (BOX.latN - LAT) / (BOX.latN - BOX.latS) };

export const caspian = {
  id: 'caspian',
  key: '5',
  title: 'Caspian & Mingachevir 1981 → 2024',
  short: 'Caspian',
  icon: 'globe',
  accent: '#34d399',
  subtitle: 'Our home region. Each note is one year of measured air temperature in Mingachevir, Azerbaijan.',
  media: { type: 'image', src: 'assets/data/caspian.jpg' },
  geo: { lon0: BOX.lonW, lonSpan: BOX.lonE - BOX.lonW, latTop: BOX.latN, latBottom: BOX.latS },
  series: true, // music comes from a data series, not from the image pixels
  credit: {
    text: 'NASA POWER (MERRA-2) yearly mean air temperature and rainfall for Mingachevir, 1981–2024; image: NASA GIBS, MODIS Terra corrected reflectance, 15 July 2023',
    url: 'https://power.larc.nasa.gov/',
  },
  scale: MAQAM.rast,
  base: 48,
  bpm: 72,
  refLabels: ['the coolest year', 'the warmest year'],
  layers: [
    { id: 'melody', label: 'Years' },
    { id: 'harmony', label: 'Decade chord' },
    { id: 'bass', label: '1980s baseline' },
    { id: 'texture', label: 'Rain' },
  ],
  legend: [
    { ico: 'music', title: 'Melody: one note per year', text: 'From 1981 to 2024. A warmer year plays a higher note. Listen to the line climb.' },
    { ico: 'trend', title: 'Drone: the 1980s', text: 'The low drone is the 1981–1990 average. Notes that sit above it are warmer than the 1980s.' },
    { ico: 'layers', title: 'Chord: each decade', text: 'The chord moves up as each decade becomes warmer than the last.' },
    { ico: 'rain', title: 'Rain: yearly rainfall', text: 'The soft rain grows in wetter years.' },
  ],

  data: null,
  idx: 0,

  async load() {
    if (this.data) return this.data;
    const d = await yearlySeries(LAT, LON, 'assets/data/mingachevir-power.json');
    const t = d.t2m_c;
    const min = Math.min(...t), max = Math.max(...t);
    const base = t.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    const iMin = t.indexOf(min), iMax = t.indexOf(max);
    this.refLabels = [`the coolest year, ${d.years[iMin]}: ${min.toFixed(1)} °C`, `the warmest year, ${d.years[iMax]}: ${max.toFixed(1)} °C`];
    this.data = { ...d, min, max, base };
    return this.data;
  },

  norm(t) { const d = this.data; return clamp01((t - d.min) / (d.max - d.min)); },

  // Columns for the sweep: the 8 years the next bar will play, all placed on Mingachevir.
  columns(n) {
    const d = this.data;
    if (!d) return [];
    return Array.from({ length: n }, (_, k) => {
      const i = (this.idx + k) % d.years.length;
      return { index: k, x: PX.x, lat: PX.y, mean: this.norm(d.t2m_c[i]), coverage: 0.5, energy: this.norm(d.t2m_c[i]), peak: 1, year: d.years[i], t: d.t2m_c[i] };
    });
  },

  stats() {
    const d = this.data;
    if (!d) return { mean: 0, coverage: 0, energy: 0, motion: 0, north: 0, south: 0 };
    const i = this.idx % d.years.length;
    return { mean: this.norm(d.t2m_c[i]), coverage: 1, energy: 0, motion: 0, north: 0, south: 0, year: d.years[i], t: d.t2m_c[i] };
  },

  current() {
    const d = this.data;
    if (!d) return null;
    const i = this.idx % d.years.length;
    return { year: d.years[i], t: d.t2m_c[i], rain: d.precip_mm_day[i], anomaly: d.t2m_c[i] - d.base };
  },

  readout() {
    const c = this.current();
    return c ? { label: `${c.year} · vs 1980s`, value: `${c.t.toFixed(1)} °C ${c.anomaly >= 0 ? '+' : ''}${c.anomaly.toFixed(1)}` } : null;
  },

  value() { return null; }, // the image is context only; Listen by Touch uses NASA POWER values

  label(v) {
    if (v == null) return 'Caspian region';
    if (v < 0.33) return 'a cool year';
    if (v < 0.66) return 'a mild year';
    return 'a hot year';
  },

  build(engine) {
    const n = (this.nodes = {});
    n.vib = new Tone.Vibrato(4.5, 0.1).connect(engine.bus);
    n.lead = new Tone.FMSynth({
      harmonicity: 2, modulationIndex: 1.2, portamento: 0.1,
      envelope: { attack: 0.05, decay: 0.5, sustain: 0.35, release: 2 },
      volume: -8,
    }).connect(n.vib);
    n.padFilter = new Tone.Filter(1600, 'lowpass').connect(engine.bus);
    n.pad = new Tone.PolySynth(Tone.AMSynth, { envelope: { attack: 2, decay: 1, sustain: 0.8, release: 4 }, volume: -25 }).connect(n.padFilter);
    n.bass = new Tone.PolySynth(Tone.Synth, { maxPolyphony: 8, oscillator: { type: 'sine' }, envelope: { attack: 1.5, decay: 0.5, sustain: 0.9, release: 4 }, volume: -26 }).connect(engine.bus);
    n.rainGain = new Tone.Gain(0).connect(engine.bus);
    n.rainFilter = new Tone.Filter({ type: 'bandpass', frequency: 1600, Q: 0.6 }).connect(n.rainGain);
    n.rain = new Tone.Noise('pink').connect(n.rainFilter).start();
  },

  reference(v, time) {
    this.nodes.lead.triggerAttackRelease(micro(v, this.scale, this.base, 2), '2n', time, 0.7);
  },

  onBar(stats, time, on) {
    const n = this.nodes, d = this.data;
    if (!d) return;
    // decade chord: average of the next 8 years
    const win = Array.from({ length: 8 }, (_, k) => d.t2m_c[(this.idx + k) % d.years.length]);
    const avg = win.reduce((a, b) => a + b, 0) / win.length;
    const root = Math.round(this.norm(avg) * 6);
    if (on('harmony')) n.pad.triggerAttackRelease(microChord(root, [0, 2, 4], this.scale, 48), '1m', time, 0.5);
    if (on('bass')) n.bass.triggerAttackRelease(micro(this.norm(d.base), this.scale, 36, 2), '1m', time, 0.6);
  },

  onStep(col, time, on) {
    const d = this.data;
    if (!d) return 0;
    const i = this.idx % d.years.length;
    this.idx = (this.idx + 1) % d.years.length;
    const v = this.norm(d.t2m_c[i]);
    if (on('texture')) this.nodes.rainGain.gain.rampTo(clamp01(d.precip_mm_day[i] / 2) * 0.12, 0.3, time);
    else this.nodes.rainGain.gain.rampTo(0, 0.5, time);
    if (!on('melody')) return 0;
    this.nodes.lead.triggerAttackRelease(micro(v, this.scale, this.base, 2), '8n', time, 0.4 + v * 0.4);
    col.year = d.years[i]; col.t = d.t2m_c[i]; col.mean = v;
    return 0.4 + v * 0.5;
  },

  describe() {
    const c = this.current(), d = this.data;
    if (!c) return 'Loading NASA POWER data for Mingachevir…';
    const late = d.t2m_c.slice(-10).reduce((a, b) => a + b, 0) / 10;
    return `Mingachevir, Azerbaijan. ${c.year}: ${c.t.toFixed(1)} °C, ${Math.abs(c.anomaly).toFixed(1)} °C ${c.anomaly >= 0 ? 'warmer' : 'cooler'} than the 1981–1990 average. ` +
      `The last ten years averaged ${late.toFixed(1)} °C, ${(late - d.base).toFixed(1)} °C above the 1980s.${d.live ? ' Data loaded live from NASA POWER.' : ''}`;
  },

  dispose() {
    if (this.nodes) this.nodes.rain.stop();
    Object.values(this.nodes || {}).forEach((x) => x.dispose());
    this.nodes = null;
  },
};
