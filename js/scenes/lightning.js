// ⚡ Lightning — flashes detected by LIS on the International Space Station (NASA SVS #5011)
/* global Tone */
import { SCALES, quantize, midiToNote, panOf, clamp01 } from '../engine.js';

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
  probeScale: SCALES.minorPent,
  probeBase: 45,
  bpm: 100,
  legend: [
    { ico: 'disc', title: 'Drums: lightning flashes', text: 'Each slice with flashes hits a drum. More flashes make harder hits.' },
    { ico: 'globe', title: 'Drum pitch: latitude', text: 'Tropical storms near the equator boom low. Storms far from the equator sound higher.' },
    { ico: 'headphones', title: 'Stereo: longitude', text: 'Thunder moves from the Americas (left) across Africa to Asia (right).' },
    { ico: 'rain', title: 'Rain: global storm activity', text: 'The rain noise swells when more of the planet is flashing.' },
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
    n.pan = new Tone.Panner(0).connect(engine.master);
    n.panWet = new Tone.Gain(0.35).connect(engine.bus);
    n.pan.connect(n.panWet);
    n.drum = new Tone.MembraneSynth({
      pitchDecay: 0.06, octaves: 5,
      envelope: { attack: 0.001, decay: 0.45, sustain: 0, release: 0.3 },
      volume: -9,
    }).connect(n.pan);
    n.crackHp = new Tone.Filter(2500, 'highpass').connect(n.pan);
    n.crack = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.09, sustain: 0 },
      volume: -24,
    }).connect(n.crackHp);
    n.rainGain = new Tone.Gain(0).connect(engine.bus);
    n.rainFilter = new Tone.Filter({ type: 'bandpass', frequency: 1400, Q: 0.6 }).connect(n.rainGain);
    n.rain = new Tone.Noise('pink').connect(n.rainFilter);
    n.rain.start();
  },

  onBar(stats, time) {
    this.nodes.rainGain.gain.rampTo(clamp01(stats.coverage * 60) * 0.22, 1.5, time);
  },

  onStep(col, time) {
    if (col.coverage < 0.0015) return;
    const { pan, drum, crack } = this.nodes;
    pan.pan.setValueAtTime(panOf(col.x), time);
    const fromEquator = clamp01(Math.abs(col.lat - 0.5) * 3);
    const midi = quantize(fromEquator, SCALES.minorPent, 31, 2);
    const vel = clamp01(0.35 + Math.sqrt(col.coverage) * 4);
    drum.triggerAttackRelease(midiToNote(midi), '8n', time, vel);
    if (col.coverage > 0.012) crack.triggerAttackRelease('32n', time + Tone.Time('32n').toSeconds(), 0.7);
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
    if (this.nodes) this.nodes.rain.stop();
    Object.values(this.nodes || {}).forEach((x) => x.dispose());
    this.nodes = null;
  },
};
