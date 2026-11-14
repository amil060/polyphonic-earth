// 🏭 Carbon Dioxide — DYAMOND / GEOS global CO₂ simulation (NASA SVS #5196)
/* global Tone */
import { SCALES, quantize, midiToNote, panOf, clamp01 } from '../engine.js';

const BASE = ['C3', 'G3', 'E4'];

export const co2 = {
  id: 'co2',
  key: '4',
  title: 'Carbon Dioxide in Motion',
  short: 'CO₂',
  icon: 'cloud',
  accent: '#fb7185',
  subtitle: 'DYAMOND GEOS simulation: CO₂ plumes over North America. Tan is lower, orange and red are higher concentrations.',
  media: { type: 'video', src: 'assets/data/co2.mp4' },
  geo: null, // rotating globe view, no flat lat/lon mapping
  credit: {
    text: 'NASA/Goddard Space Flight Center Scientific Visualization Studio: "DYAMOND Global Carbon Dioxide" (GEOS model)',
    url: 'https://svs.gsfc.nasa.gov/5196/',
  },
  probeScale: SCALES.minorPent,
  probeBase: 48,
  bpm: 70,
  legend: [
    { ico: 'music', title: 'Harmony: CO₂ level', text: 'Low CO₂ gives a calm, open chord. As more of the view turns orange and red, clashing notes join and the harmony gets tense.' },
    { ico: 'sliders', title: 'Brightness: concentration', text: 'Higher average CO₂ opens the filter, so the sound gets brighter and harsher.' },
    { ico: 'lines', title: 'Sweep melody: plumes', text: 'Strong plumes play a gritty melody as the sweep crosses them, panned left to right.' },
    { ico: 'fog', title: 'Haze: plume coverage', text: 'A low rumble grows as the plume spreads across more of the view.' },
  ],

  value(r, g, b) {
    // Calibrated on the SVS frames: tan haze ≈ (118,96,52), orange plume ≈ (168,127,55),
    // red source regions have r − b > 150. Snow/space/water have r ≈ b or b > r.
    if (Math.max(r, g, b) < 45 || r < g || r - b < 30) return null;
    return clamp01((r - b - 30) / 150);
  },

  label(v) {
    if (v == null) return 'no plume';
    if (v < 0.35) return 'background CO₂';
    if (v < 0.55) return 'elevated CO₂';
    if (v < 0.75) return 'high CO₂ plume';
    return 'very high CO₂ (source region)';
  },

  build(engine) {
    const n = (this.nodes = {});
    n.filter = new Tone.Filter(600, 'lowpass').connect(engine.bus);
    n.pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsawtooth', count: 3, spread: 25 },
      envelope: { attack: 1.5, decay: 1, sustain: 0.7, release: 2.5 },
      volume: -26,
    }).connect(n.filter);
    n.pan = new Tone.Panner(0).connect(engine.bus);
    n.lead = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.4 },
      filterEnvelope: { attack: 0.005, decay: 0.25, sustain: 0.2, baseFrequency: 400, octaves: 3 },
      volume: -18,
    }).connect(n.pan);
    n.hazeGain = new Tone.Gain(0).connect(engine.bus);
    n.hazeFilter = new Tone.Filter(350, 'lowpass').connect(n.hazeGain);
    n.haze = new Tone.Noise('brown').connect(n.hazeFilter);
    n.haze.start();
  },

  onBar(stats, time) {
    const m = stats.mean;
    const chord = [...BASE];
    if (m > 0.3) chord.push('F#4');   // tritone
    if (m > 0.4) chord.push('C#4');   // minor second clash
    if (m > 0.5) chord.push('B3');    // dense cluster
    this.nodes.pad.triggerAttackRelease(chord, '1m', time, 0.6);
    this.nodes.filter.frequency.rampTo(350 + Math.pow(clamp01(m), 1.5) * 3800, 1.2, time);
    this.nodes.hazeGain.gain.rampTo(clamp01(stats.coverage * 1.4) * 0.35, 1.5, time);
  },

  onStep(col, time) {
    if (col.coverage < 0.1 || col.mean < 0.33) return;
    const midi = quantize(col.mean, SCALES.minorPent, 52, 2);
    this.nodes.pan.pan.setValueAtTime(panOf(col.x), time);
    const vel = 0.3 + col.mean * 0.5;
    this.nodes.lead.triggerAttackRelease(midiToNote(midi), '16n', time, vel);
    return vel;
  },

  describe(stats, cols) {
    const hot = cols.filter((c) => c.coverage > 0.1 && c.mean > 0.33).length;
    const tension = stats.mean > 0.5 ? 'very tense' : stats.mean > 0.4 ? 'tense' : stats.mean > 0.3 ? 'slightly uneasy' : 'calm';
    return `Carbon dioxide. ${Math.round(stats.coverage * 100)}% of the view is covered by plume; average level is ${this.label(stats.mean)}. ` +
      `The harmony is ${tension}. ${hot} of 16 slices contain strong plumes and play the gritty melody.`;
  },

  dispose() {
    if (this.nodes) this.nodes.haze.stop();
    Object.values(this.nodes || {}).forEach((x) => x.dispose());
    this.nodes = null;
  },
};
