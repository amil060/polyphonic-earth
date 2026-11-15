// Ocean — ECCO2 sea surface currents coloured by temperature (NASA SVS #3912)
/* global Tone */
import { rgbToHsl } from '../analyzer.js?v=20261115195842';
import { MAQAM, micro, microChord, panOf, clamp01 } from '../engine.js?v=20261115195842';

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
  scale: MAQAM.rast,
  base: 52,
  bpm: 66,
  refLabels: ['coldest water', 'warmest water'],
  layers: [
    { id: 'melody', label: 'Melody' },
    { id: 'harmony', label: 'Harmony' },
    { id: 'bass', label: 'Bass' },
    { id: 'texture', label: 'Sea' },
  ],
  legend: [
    { ico: 'music', title: 'Melody: temperature', text: 'The sweep crosses the map west to east. Warm water sings high, cold water sings low. A soft knock means land.' },
    { ico: 'headphones', title: 'Stereo: longitude', text: 'Notes move from your left ear (west) to your right ear (east).' },
    { ico: 'layers', title: 'Harmony: global warmth', text: 'The chord climbs as the visible ocean warms.' },
    { ico: 'wind', title: 'Sea: current speed', text: 'Faster, swirling currents raise the sound of the sea.' },
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
    n.pan = new Tone.Panner(0).connect(engine.bus);
    n.vib = new Tone.Vibrato(4.5, 0.12).connect(n.pan);
    n.lead = new Tone.FMSynth({
      harmonicity: 2, modulationIndex: 1.4, portamento: 0.12,
      envelope: { attack: 0.06, decay: 0.6, sustain: 0.35, release: 2.4 },
      modulationEnvelope: { attack: 0.2, decay: 0.5, sustain: 0.3, release: 2 },
      volume: -7,
    }).connect(n.vib);
    n.padFilter = new Tone.Filter(1400, 'lowpass').connect(engine.bus);
    n.pad = new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 1.5,
      envelope: { attack: 2.5, decay: 1, sustain: 0.8, release: 5 },
      volume: -24,
    }).connect(n.padFilter);
    n.bass = new Tone.PolySynth(Tone.Synth, { maxPolyphony: 8,
      oscillator: { type: 'sine' },
      envelope: { attack: 1.5, decay: 0.5, sustain: 0.9, release: 4 },
      volume: -28,
    }).connect(engine.bus);
    n.seaGain = new Tone.Gain(0).connect(engine.bus);
    n.seaFilter = new Tone.AutoFilter({ frequency: 0.08, baseFrequency: 200, octaves: 3 }).connect(n.seaGain).start();
    n.sea = new Tone.Noise('pink').connect(n.seaFilter).start();
  },

  // Visible ocean water mostly sits between 0.3 and 0.9 on the colour scale;
  // stretch that band over three octaves so the melody has room to move.
  pitch(v) { return micro(clamp01((v - 0.3) / 0.6), this.scale, 45, 3); },

  reference(v, time) {
    this.nodes.pan.pan.rampTo(0, 0.06, time);
    this.nodes.lead.triggerAttackRelease(micro(v, this.scale, 45, 3), '2n', time, 0.7);
  },

  onBar(stats, time, on) {
    const n = this.nodes;
    const root = Math.round(clamp01((stats.mean - 0.3) / 0.5) * 6);
    if (on('harmony')) n.pad.triggerAttackRelease(microChord(root, [0, 2, 4, 6], this.scale, 45), '1m', time, 0.5);
    if (on('bass')) n.bass.triggerAttackRelease(microChord(root, [0], this.scale, 33)[0], '1m', time, 0.7);
    n.seaGain.gain.rampTo(on('texture') ? 0.05 + clamp01(stats.motion * 20) * 0.12 : 0, 2, time);
  },

  onStep(col, time, on, engine) {
    if (!on('melody')) return 0;
    if (col.coverage < 0.12) { engine.knockAt(col.x, time); return 0; } // land
    const vel = 0.3 + col.coverage * 0.6;
    this.nodes.pan.pan.rampTo(panOf(col.x), 0.06, time);
    this.nodes.lead.triggerAttackRelease(this.pitch(col.mean), '4n', time, vel);
    return vel;
  },

  describe(stats, cols) {
    const warm = [...cols].sort((a, b) => b.mean * b.coverage - a.mean * a.coverage)[0];
    const side = warm.x < 0.33 ? 'western' : warm.x < 0.66 ? 'central' : 'eastern';
    return `Ocean currents. Average visible water is ${this.label(stats.mean)}. ` +
      `The warmest band is in the ${side} part of the map, so the highest notes come from your ` +
      `${warm.x < 0.5 ? 'left' : 'right'}. ${stats.motion > 0.02 ? 'Currents are swirling strongly right now.' : 'Currents are calm right now.'}`;
  },

  dispose() {
    if (this.nodes) this.nodes.sea.stop();
    Object.values(this.nodes || {}).forEach((x) => x.dispose());
    this.nodes = null;
  },
};
