// Azerbaijan, west to east — eight cities, five decades of warming (NASA POWER + NASA GIBS MODIS imagery)
// Each bar is one decade (1980s → 2020s). The sweep plays the eight cities from west to east, so the
// left-to-right movement is real geography: Nakhchivan sounds on the left, Baku on the right. A note's
// pitch is how much warmer that city's decade was than its own 1981–1990 average.
/* global Tone */
import { MAQAM, micro, microChord, clamp01 } from '../engine.js?v=20261115220615';

const BOX = { lonW: 43, lonE: 55, latN: 48, latS: 36 }; // the satellite image bounds
const toX = (lon) => (lon - BOX.lonW) / (BOX.lonE - BOX.lonW);
const toY = (lat) => (BOX.latN - lat) / (BOX.latN - BOX.latS);
const DECADES = [
  { label: '1980s', from: 1981, to: 1990 },
  { label: '1990s', from: 1991, to: 2000 },
  { label: '2000s', from: 2001, to: 2010 },
  { label: '2010s', from: 2011, to: 2020 },
  { label: '2020s', from: 2021, to: 2024 },
];
const N_CITIES = 8;
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const signed = (v) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}`;

export const caspian = {
  id: 'caspian',
  key: '5',
  title: 'Azerbaijan, west to east 1981 → 2024',
  short: 'Azerbaijan',
  icon: 'globe',
  accent: '#34d399',
  subtitle: 'Eight cities from Nakhchivan to Baku. Each bar is one decade; each note is one city, played from west to east.',
  media: { type: 'image', src: 'assets/data/caspian.jpg' },
  geo: { lon0: BOX.lonW, lonSpan: BOX.lonE - BOX.lonW, latTop: BOX.latN, latBottom: BOX.latS },
  series: true, // music comes from a data series, not from the image pixels
  credit: {
    text: 'NASA POWER (MERRA-2) yearly mean air temperature and rainfall for eight Azerbaijani cities, 1981–2024; image: NASA GIBS, MODIS Terra corrected reflectance, 15 July 2023',
    url: 'https://power.larc.nasa.gov/',
  },
  scale: MAQAM.rast,
  base: 48,
  bpm: 66,
  refLabels: ['no change from the 1980s', 'the most warming'],
  layers: [
    { id: 'melody', label: 'Cities' },
    { id: 'harmony', label: 'National chord' },
    { id: 'bass', label: '1980s baseline' },
    { id: 'texture', label: 'Rain' },
  ],
  legend: [
    { ico: 'music', title: 'Melody: one note per city', text: 'Eight cities from west (left ear) to east (right ear): Nakhchivan, Ganja, Mingachevir, Gabala, Shamakhi, Lankaran, Sumgait, Baku.' },
    { ico: 'trend', title: 'Pitch: warming since the 1980s', text: 'A higher note means that city’s decade was warmer than its own 1981–1990 average. Each bar is the next decade.' },
    { ico: 'layers', title: 'Chord: the whole country', text: 'The chord follows the average warming of all eight cities: up through the 2000s, a small dip in the 2010s, highest in the 2020s.' },
    { ico: 'rain', title: 'Rain: rainfall', text: 'The soft rain grows in wetter places and decades.' },
  ],

  data: null,
  idx: 0, // step counter: decade = floor(idx / 8), city = idx % 8

  async load() {
    if (this.data) return this.data;
    const j = await fetch('assets/data/azerbaijan-power.json').then((r) => r.json());
    const years = j.years;
    const cities = j.cities.map((c) => {
      const pick = (arr, d) => arr.filter((_, i) => years[i] >= d.from && years[i] <= d.to);
      const dec = DECADES.map((d) => avg(pick(c.t2m_c, d)));
      const rain = DECADES.map((d) => avg(pick(c.precip_mm_day, d)));
      return { ...c, x: toX(c.lon), y: toY(c.lat), anom: dec.map((t) => t - dec[0]), rain, early: avg(c.t2m_c.slice(0, 10)), late: avg(c.t2m_c.slice(-10)) };
    });
    const all = cities.flatMap((c) => c.anom);
    const min = Math.min(...all), max = Math.max(...all);
    const national = DECADES.map((_, d) => avg(cities.map((c) => c.anom[d])));
    const top = cities.reduce((a, b) => (b.late - b.early > a.late - a.early ? b : a));
    this.places = cities.map((c) => ({ name: c.name, x: c.x, y: c.y }));
    this.refLabels = [`${signed(min)} °C, no change from the 1980s`, `${signed(max)} °C, the most warming (${cities.find((c) => c.anom.includes(max)).name}, ${DECADES[cities.find((c) => c.anom.includes(max)).anom.indexOf(max)].label})`];
    this.data = { cities, min, max, national, top };
    return this.data;
  },

  norm(a) { const d = this.data; return clamp01((a - d.min) / (d.max - d.min)); },
  decadeAt(i) { return Math.min(DECADES.length - 1, Math.floor(i / N_CITIES)); },

  // Columns for the sweep: the eight cities of the decade the next bar will play, at their real places.
  columns(n) {
    const d = this.data;
    if (!d) return [];
    const dec = this.decadeAt(this.idx);
    return Array.from({ length: n }, (_, k) => {
      const c = d.cities[k % N_CITIES];
      const v = this.norm(c.anom[dec]);
      return { index: k, x: c.x, lat: c.y, mean: v, coverage: 0.5, energy: v, peak: 1, city: c.name, decade: DECADES[dec].label, anom: c.anom[dec] };
    });
  },

  stats() {
    const d = this.data;
    if (!d) return { mean: 0, coverage: 0, energy: 0, motion: 0, north: 0, south: 0 };
    const dec = this.decadeAt(this.idx);
    return { mean: this.norm(d.national[dec]), coverage: 1, energy: 0, motion: 0, north: 0, south: 0 };
  },

  current() {
    const d = this.data;
    if (!d) return null;
    // After the last city the index wraps to 0: keep showing the decade that was just played.
    const dec = this.idx === 0 && this.lastDec != null ? this.lastDec : this.decadeAt(this.idx);
    return { decade: DECADES[dec].label, anomaly: d.national[dec] };
  },

  readout() {
    const c = this.current();
    return c ? { label: `${c.decade} · vs 1980s`, value: `${signed(c.anomaly)} °C` } : null;
  },

  value() { return null; }, // the image is context only; Listen by Touch uses NASA POWER values

  label(v) {
    if (v == null) return 'Azerbaijan';
    if (v < 0.33) return 'little warming';
    if (v < 0.66) return 'clear warming';
    return 'strong warming';
  },

  build(engine) {
    const n = (this.nodes = {});
    n.pan = new Tone.Panner(0).connect(engine.bus);
    n.vib = new Tone.Vibrato(4.5, 0.1).connect(n.pan);
    n.lead = new Tone.FMSynth({
      harmonicity: 2, modulationIndex: 1.2, portamento: 0.05,
      envelope: { attack: 0.05, decay: 0.5, sustain: 0.35, release: 1.6 },
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
    this.nodes.pan.pan.rampTo(0, 0.06, time);
    this.nodes.lead.triggerAttackRelease(micro(v, this.scale, this.base, 2), '2n', time, 0.7);
  },

  onBar(stats, time, on) {
    const n = this.nodes, d = this.data;
    if (!d) return;
    const dec = this.decadeAt(this.idx);
    const root = Math.round(this.norm(d.national[dec]) * 6);
    if (on('harmony')) n.pad.triggerAttackRelease(microChord(root, [0, 2, 4], this.scale, 48), '1m', time, 0.5);
    if (on('bass')) n.bass.triggerAttackRelease(micro(this.norm(0), this.scale, 36, 2), '1m', time, 0.6);
  },

  onStep(col, time, on) {
    const d = this.data;
    if (!d) return 0;
    const i = this.idx;
    const dec = this.decadeAt(i), k = i % N_CITIES;
    this.lastDec = i === 0 ? null : dec;
    this.idx = (i + 1) % (DECADES.length * N_CITIES);
    if (this.idx === 0) this.lastDec = dec;
    const c = d.cities[k];
    const v = this.norm(c.anom[dec]);
    this.nodes.pan.pan.rampTo((c.x - 0.2) / 0.37 * 1.6 - 0.8, 0.08, time); // west = left ear, east = right ear
    if (on('texture')) this.nodes.rainGain.gain.rampTo(clamp01(c.rain[dec] / 2) * 0.12, 0.3, time);
    else this.nodes.rainGain.gain.rampTo(0, 0.5, time);
    if (!on('melody')) return 0;
    this.nodes.lead.triggerAttackRelease(micro(v, this.scale, this.base, 2), '8n', time, 0.4 + v * 0.4);
    Object.assign(col, { city: c.name, decade: DECADES[dec].label, anom: c.anom[dec], mean: v, x: c.x, lat: c.y });
    return 0.4 + v * 0.5;
  },

  describe() {
    const c = this.current(), d = this.data;
    if (!c) return 'Loading NASA POWER data for eight Azerbaijani cities…';
    const lateAll = avg(d.cities.map((x) => x.late - x.early));
    return `Azerbaijan, ${c.decade}: the eight cities were on average ${signed(c.anomaly)} °C compared with the 1980s. ` +
      `Over 2015–2024 every city was warmer than in 1981–1990, by ${lateAll.toFixed(1)} °C on average; the most in ${d.top.name} (${signed(d.top.late - d.top.early)} °C). ` +
      'Notes move from Nakhchivan in the west to Baku in the east.';
  },

  dispose() {
    if (this.nodes) this.nodes.rain.stop();
    Object.values(this.nodes || {}).forEach((x) => x.dispose());
    this.nodes = null;
  },
};
