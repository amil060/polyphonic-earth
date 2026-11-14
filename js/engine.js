// Shared audio engine: master chain, musical scales, and the Listen-by-Touch probe voice.
/* global Tone */

export const SCALES = {
  majorPent: [0, 2, 4, 7, 9],
  minorPent: [0, 3, 5, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
};

/** Map a 0..1 value onto a musical scale. Returns a MIDI note number. */
export function quantize(v, scale, baseMidi = 48, octaves = 3) {
  const steps = scale.length * octaves;
  const i = Math.max(0, Math.min(steps, Math.round(v * steps)));
  return baseMidi + Math.floor(i / scale.length) * 12 + scale[i % scale.length];
}

export const midiToNote = (m) => Tone.Frequency(m, 'midi').toNote();
export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const panOf = (x) => Math.max(-0.95, Math.min(0.95, x * 2 - 1));

export class Engine {
  constructor() {
    this.started = false;
  }

  async start() {
    if (this.started) return;
    await Tone.start();
    this.limiter = new Tone.Limiter(-3).toDestination();
    this.master = new Tone.Volume(-8).connect(this.limiter);
    this.reverb = new Tone.Reverb({ decay: 5, preDelay: 0.02, wet: 0.35 }).connect(this.master);
    await this.reverb.generate();
    this.bus = new Tone.Gain(1).connect(this.reverb); // scenes connect here

    // Probe voice for Listen by Touch: clear sine tone, panned by position.
    this.probePan = new Tone.Panner(0).connect(this.master);
    this.probe = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.12, sustain: 0.25, release: 0.25 },
      volume: -10,
    }).connect(this.probePan);
    this.tick = new Tone.NoiseSynth({
      noise: { type: 'brown' },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0 },
      volume: -26,
    }).connect(this.probePan);

    Tone.Transport.bpm.value = 84;
    this.started = true;
  }

  setVolume(pct) {
    if (!this.master) return;
    // 0..100 → -60..0 dB, capped by the limiter for hearing safety
    this.master.volume.rampTo(pct <= 0 ? -Infinity : -40 + pct * 0.36, 0.1);
  }

  /** Play the touch probe: value 0..1 → pitch, x 0..1 → stereo, null → soft "no data" tick. */
  playProbe(value, x, scene) {
    if (!this.started) return;
    const now = Tone.now();
    this.probePan.pan.setValueAtTime(panOf(x), now);
    if (value == null) { this.tick.triggerAttackRelease(0.04, now); return; }
    const midi = quantize(value, scene.probeScale || SCALES.majorPent, scene.probeBase || 52, 3);
    this.probe.triggerAttackRelease(midiToNote(midi), 0.18, now, 0.5 + value * 0.4);
  }
}
