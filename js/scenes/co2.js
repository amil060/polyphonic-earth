// Carbon Dioxide — DYAMOND / GEOS global CO₂ simulation (NASA SVS #5196)
/* global Tone */
import { MAQAM, micro, microChord, panOf, clamp01 } from '../engine.js?v=20261115215256';

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
  scale: MAQAM.hijaz,
  base: 50,
  bpm: 60,
  refLabels: ['background CO₂', 'a strong CO₂ plume'],
  layers: [
    { id: 'melody', label: 'Melody' },
    { id: 'harmony', label: 'Harmony' },
    { id: 'bass', label: 'Bass' },
    { id: 'texture', label: 'Haze' },
  ],
  legend: [
    { ico: 'music', title: 'Harmony: CO₂ level', text: 'Low CO₂ gives a calm, open chord. As plumes grow, its notes drift a few cents apart and start to beat against each other, so the chord shimmers and grows tense.' },
    { ico: 'sliders', title: 'Brightness: concentration', text: 'Higher average CO₂ opens the filter, so the sound gets brighter and harsher.' },
    { ico: 'lines', title: 'Melody: plumes', text: 'Each slice with CO₂ plays a slow note as the sweep crosses it: higher for stronger plumes, panned left to right.' },
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
    // Two copies of the same chord; the second drifts away in cents as CO₂ rises (microtonal beating).
    n.padA = new Tone.PolySynth(Tone.AMSynth, { envelope: { attack: 2.5, decay: 1, sustain: 0.8, release: 5 }, volume: -25 }).connect(n.filter);
    n.padB = new Tone.PolySynth(Tone.AMSynth, { envelope: { attack: 2.5, decay: 1, sustain: 0.8, release: 5 }, volume: -25 }).connect(n.filter);
    n.pan = new Tone.Panner(0).connect(engine.bus);
    n.vib = new Tone.Vibrato(5, 0.15).connect(n.pan);
    n.lead = new Tone.MonoSynth({
      oscillator: { type: 'triangle' }, portamento: 0.15,
      envelope: { attack: 0.08, decay: 0.5, sustain: 0.3, release: 2 },
      filterEnvelope: { attack: 0.05, decay: 0.4, sustain: 0.4, baseFrequency: 500, octaves: 2.5 },
      volume: -10,
    }).connect(n.vib);
    n.bass = new Tone.PolySynth(Tone.Synth, { maxPolyphony: 8, oscillator: { type: 'sine' }, envelope: { attack: 2, decay: 0.5, sustain: 0.9, release: 4 }, volume: -28 }).connect(engine.bus);
    n.hazeGain = new Tone.Gain(0).connect(engine.bus);
    n.hazeFilter = new Tone.Filter(350, 'lowpass').connect(n.hazeGain);
    n.haze = new Tone.Noise('brown').connect(n.hazeFilter).start();
  },

  reference(v, time) {
    this.nodes.pan.pan.rampTo(0, 0.06, time);
    this.nodes.lead.triggerAttackRelease(micro(v, this.scale, this.base), '2n', time, 0.7);
  },

  onBar(stats, time, on) {
    const n = this.nodes;
    const m = clamp01(stats.mean);
    if (on('harmony')) {
      const chord = microChord(0, [0, 2, 4], MAQAM.rast, 48);
      const drift = Math.pow(2, (m * 45) / 1200); // up to 45 cents apart → audible beating
      n.padA.triggerAttackRelease(chord, '1m', time, 0.5);
      n.padB.triggerAttackRelease(chord.map((f) => f * drift), '1m', time, 0.5);
    }
    if (on('bass')) n.bass.triggerAttackRelease(microChord(0, [0], MAQAM.rast, 36)[0], '1m', time, 0.6);
    n.filter.frequency.rampTo(350 + Math.pow(m, 1.5) * 3800, 1.2, time);
    n.hazeGain.gain.rampTo(on('texture') ? clamp01(stats.coverage * 1.4) * 0.12 : 0, 1.5, time);
  },

  onStep(col, time, on) {
    if (!on('melody') || col.coverage < 0.05) return 0;
    this.nodes.pan.pan.rampTo(panOf(col.x), 0.06, time);
    const vel = 0.3 + col.mean * 0.5;
    this.nodes.lead.triggerAttackRelease(micro(col.mean, this.scale, this.base), '4n', time, vel);
    return vel;
  },

  describe(stats, cols) {
    const hot = cols.filter((c) => c.coverage > 0.05 && c.mean > 0.33).length;
    const tension = stats.mean > 0.5 ? 'very tense' : stats.mean > 0.4 ? 'tense' : stats.mean > 0.3 ? 'slightly uneasy' : 'calm';
    return `Carbon dioxide. ${Math.round(stats.coverage * 100)}% of the view is covered by plume; average level is ${this.label(stats.mean)}. ` +
      `The harmony is ${tension}. ${hot} of ${cols.length} slices contain strong plumes and play the melody.`;
  },

  dispose() {
    if (this.nodes) this.nodes.haze.stop();
    Object.values(this.nodes || {}).forEach((x) => x.dispose());
    this.nodes = null;
  },
};
