// 🌊 Ocean — ECCO2 sea surface currents coloured by temperature (NASA SVS #3912)
/* global Tone */
import { rgbToHsl } from '../analyzer.js';
import { SCALES, quantize, midiToNote, panOf, clamp01 } from '../engine.js';

const CHORDS = [ // cold → warm
  ['D2', 'A2', 'F3', 'C4'],
  ['F2', 'C3', 'A3', 'E4'],
  ['A2', 'E3', 'C4', 'G4'],
  ['C3', 'G3', 'E4', 'B4'],
  ['G3', 'D4', 'B4', 'F#5'],
];

export const ocean = {
  id: 'ocean',
  key: '1',
  title: 'Ocean Currents & Temperature',
  short: 'Ocean',
  icon: 'waves',
  accent: '#67e8f9',
  subtitle: 'ECCO2 model: sea surface currents, coloured from cold (blue) to warm (red).',
  media: { type: 'video', src: 'assets/data/ocean.mp4' },
  geo: { lon0: 138, latTop: 90, latBottom: -90 },
  credit: {
    text: 'NASA/Goddard Space Flight Center Scientific Visualization Studio: "Global Sea Surface Currents and Temperature" (ECCO2 model)',
    url: 'https://svs.gsfc.nasa.gov/3912/',
  },
  probeScale: SCALES.majorPent,
  probeBase: 48,
  bpm: 76,
  legend: [
    { ico: 'music', title: 'Sweep melody: temperature', text: 'A sweep crosses the map west to east. Warm water plays high notes, cold water plays low notes. Silence means land.' },
    { ico: 'headphones', title: 'Stereo: longitude', text: 'Notes move from your left ear (west) to your right ear (east).' },
    { ico: 'layers', title: 'Pad chord: global warmth', text: 'The background chord brightens from minor to major as the visible ocean warms.' },
    { ico: 'wind', title: 'Brightness: current speed', text: 'Faster, swirling currents open the filter and make the pad shimmer.' },
  ],

  value(r, g, b) {
    const { h, s, l } = rgbToHsl(r, g, b);
    if (s < 0.35 || l < 0.12) return null; // grey land, black background
    if (h > 300) return 1;                  // red-magenta end of the scale
    if (h > 250) return 0;
    return clamp01(1 - h / 240);            // blue 240° → 0 (cold), red 0° → 1 (warm)
  },

  label(v) {
    if (v == null) return 'land or no data';
    if (v < 0.2) return 'icy polar water';
    if (v < 0.4) return 'cold water';
    if (v < 0.6) return 'mild water';
    if (v < 0.8) return 'warm water';
    return 'tropical water';
  },

  build(engine) {
    const n = (this.nodes = {});
    n.filter = new Tone.Filter(900, 'lowpass').connect(engine.bus);
    n.pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsine', count: 3, spread: 18 },
      envelope: { attack: 1.2, decay: 1, sustain: 0.7, release: 3 },
      volume: -20,
    }).connect(n.filter);
    n.pan = new Tone.Panner(0).connect(engine.bus);
    n.lead = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.25, sustain: 0.15, release: 0.6 },
      volume: -11,
    }).connect(n.pan);
  },

  onBar(stats, time) {
    const i = Math.round(clamp01((stats.mean - 0.3) / 0.5) * (CHORDS.length - 1));
    this.nodes.pad.triggerAttackRelease(CHORDS[i], '1m', time, 0.5);
    this.nodes.filter.frequency.rampTo(500 + clamp01(stats.motion * 25) * 2600, 1, time);
  },

  onStep(col, time) {
    if (col.coverage < 0.12) return; // land → silence
    const midi = quantize(col.mean, SCALES.majorPent, 57, 2);
    this.nodes.pan.pan.setValueAtTime(panOf(col.x), time);
    const vel = 0.25 + col.coverage * 0.6;
    this.nodes.lead.triggerAttackRelease(midiToNote(midi), '8n', time, vel);
    return vel; // note strength → ripple size
  },

  describe(stats, cols) {
    const warm = [...cols].sort((a, b) => b.mean * b.coverage - a.mean * a.coverage)[0];
    const side = warm.x < 0.33 ? 'western' : warm.x < 0.66 ? 'central' : 'eastern';
    return `Ocean currents. Average visible water is ${this.label(stats.mean)}. ` +
      `The warmest band is in the ${side} part of the map, so the highest notes come from your ` +
      `${warm.x < 0.5 ? 'left' : 'right'}. ${stats.motion > 0.02 ? 'Currents are swirling strongly right now.' : 'Currents are calm right now.'}`;
  },

  dispose() { Object.values(this.nodes || {}).forEach((x) => x.dispose()); this.nodes = null; },
};
