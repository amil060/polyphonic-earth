// Lightning — flashes detected by LIS on the International Space Station (NASA SVS #5011)
/* global Tone */
import { MAQAM, micro, microChord, panOf, clamp01 } from '../engine.js';

export const lightning = {
  id: 'lightning',
  key: '3',
  title: 'Lightning from the Space Station',
  short: 'Lightning',
  icon: 'zap',
  accent: '#fde047',
  subtitle: 'Every yellow dot is a lightning flash seen by the ISS Lightning Imaging Sensor (2017–2023).',
  media: { type: 'video', src: 'assets/data/lightning.mp4' },
  geo: { lon0: -180, latTop: 90, latBottom: -90 },
  credit: {
    text: 'NASA/Goddard Space Flight Center Scientific Visualization Studio: "Lightning Events Detected from the International Space Station (ISS) 2017–2023" (LIS data)',
    url: 'https://svs.gsfc.nasa.gov/5011/',
  },
  scale: MAQAM.saba,
  base: 33,
  bpm: 76,
  refLabels: ['a storm on the equator', 'a storm far from the equator'],
  layers: [
    { id: 'melody', label: 'Drums' },
    { id: 'harmony', label: 'Storm chord' },
    { id: 'bass', label: 'Thunder' },
    { id: 'texture', label: 'Rain' },
  ],
  legend: [
    { ico: 'disc', title: 'Drums: lightning flashes', text: 'Each slice with flashes hits a deep drum. More flashes make harder hits.' },
    { ico: 'globe', title: 'Drum pitch: latitude', text: 'Tropical storms near the equator boom low. Storms far from the equator sound higher.' },
    { ico: 'headphones', title: 'Stereo: longitude', text: 'Thunder moves from the Americas (left) across Africa to Asia (right).' },
    { ico: 'rain', title: 'Rain and thunder: storm activity', text: 'Rain swells and distant thunder rolls when more of the planet is flashing.' },
  ],

  value(r, g, b) {
    // Calibrated on the SVS frames: flashes are yellow-green dots (e.g. 77,84,42 / 131,144,50)
    // on a neutral grey map (r ≈ g ≈ b).
    if (r < 55 || g < 60 || g - b < 30) return null;
    return clamp01((Math.max(r, g) - 50) / 110);
  },

  label(v) {
    if (v == null) return 'no lightning';
    return v > 0.6 ? 'intense lightning' : 'lightning flashes';
  },

  build(engine) {
    const n = (this.nodes = {});
    n.pan = new Tone.Panner(0).connect(engine.bus);
    // Polyphonic, so a new hit never cuts off the tail of the previous one (that cut was a click).
    n.drum = new Tone.PolySynth(Tone.MembraneSynth, {
      maxPolyphony: 6,
      pitchDecay: 0.08, octaves: 4,
      envelope: { attack: 0.005, decay: 0.9, sustain: 0, release: 0.8 },
      volume: -11,
    }).connect(n.pan);
    n.padFilter = new Tone.Filter(900, 'lowpass').connect(engine.bus);
    n.pad = new Tone.PolySynth(Tone.AMSynth, {
      envelope: { attack: 3, decay: 1, sustain: 0.8, release: 5 },
      volume: -26,
    }).connect(n.padFilter);
    n.thunderGain = new Tone.Gain(0).connect(engine.bus);
    n.thunderFilter = new Tone.Filter(160, 'lowpass').connect(n.thunderGain);
    n.thunder = new Tone.Noise('brown').connect(n.thunderFilter).start();
    n.rainGain = new Tone.Gain(0).connect(engine.bus);
    n.rainFilter = new Tone.Filter({ type: 'bandpass', frequency: 1400, Q: 0.6 }).connect(n.rainGain);
    n.rain = new Tone.Noise('pink').connect(n.rainFilter).start();
  },

  reference(v, time) {
    this.nodes.pan.pan.rampTo(0, 0.06, time);
    this.nodes.drum.triggerAttackRelease(micro(v, this.scale, this.base), '4n', time, 0.8);
  },

  onBar(stats, time, on) {
    const n = this.nodes;
    const activity = clamp01(stats.coverage * 60);
    if (on('harmony')) n.pad.triggerAttackRelease(microChord(0, [0, 2, 3], this.scale, 45), '1m', time, 0.4 + activity * 0.3);
    // Hold the current level instead of jumping to zero, so a new swell never clicks.
    n.thunderGain.gain.cancelAndHoldAtTime(time);
    if (on('bass') && activity > 0.2) {
      n.thunderGain.gain.linearRampToValueAtTime(0.3 * activity, time + 0.6);
      n.thunderGain.gain.linearRampToValueAtTime(0, time + 2.8);
    } else {
      n.thunderGain.gain.linearRampToValueAtTime(0, time + 0.5);
    }
    n.rainGain.gain.rampTo(on('texture') ? activity * 0.2 : 0, 2, time);
  },

  onStep(col, time, on) {
    if (!on('melody') || col.coverage < 0.0015) return 0;
    this.nodes.pan.pan.rampTo(panOf(col.x), 0.06, time);
    const fromEquator = clamp01(Math.abs(col.lat - 0.5) * 3);
    const vel = Math.min(0.85, 0.35 + Math.sqrt(col.coverage) * 4);
    this.nodes.drum.triggerAttackRelease(micro(fromEquator, this.scale, this.base), '8n', time, vel);
    return vel;
  },

  describe(stats, cols) {
    const total = stats.north + stats.south || 1;
    const northShare = Math.round((stats.north / total) * 100);
    const busiest = [...cols].sort((a, b) => b.coverage - a.coverage)[0];
    const lon = -180 + busiest.x * 360;
    const where = lon < -30 ? 'the Americas' : lon < 60 ? 'Africa and Europe' : 'Asia and Oceania';
    const season = northShare > 60 ? 'This looks like northern summer: storms follow the Sun north.'
      : northShare < 40 ? 'This looks like southern summer: storms follow the Sun south.'
      : 'Storms are spread evenly around the equator.';
    return `Lightning. ${northShare}% of the flashes are north of the equator. The busiest drums are over ${where}. ${season}`;
  },

  dispose() {
    if (this.nodes) { this.nodes.rain.stop(); this.nodes.thunder.stop(); }
    Object.values(this.nodes || {}).forEach((x) => x.dispose());
    this.nodes = null;
  },
};
