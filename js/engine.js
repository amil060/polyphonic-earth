// Shared audio engine: ambient master chain, microtonal maqam scales, and the Listen-by-Touch probe.
/* global Tone */

export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const panOf = (x) => Math.max(-0.9, Math.min(0.9, x * 2 - 1));
const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

/**
 * Quarter-tone (24-EDO) maqam scales, written in cents from the tonic.
 * Neutral seconds and thirds (150 and 350 cents) sit between the piano keys,
 * which gives the music its microtonal colour.
 */
export const MAQAM = {
  rast: [0, 200, 350, 500, 700, 900, 1050],    // bright, open
  bayati: [0, 150, 300, 500, 700, 800, 1000],  // warm, searching
  saba: [0, 150, 300, 400, 700, 800, 1000],    // tense, unresolved
  hijaz: [0, 100, 400, 500, 700, 800, 1000],   // dramatic
};

/**
 * Map a 0..1 data value to a frequency on a microtonal scale.
 * The value picks a scale degree; what is left over between two degrees bends the
 * note by up to ±25 cents, so small differences in the data stay audible.
 */
export function micro(v, scale, baseMidi = 48, octaves = 2) {
  const steps = scale.length * octaves;
  const pos = clamp01(v) * steps;
  const i = Math.min(steps, Math.floor(pos));
  const frac = pos - i;
  const cents = Math.floor(i / scale.length) * 1200 + scale[i % scale.length] + (frac - 0.5) * 50;
  return midiHz(baseMidi) * Math.pow(2, cents / 1200);
}

/** A chord on the same maqam: degrees are scale indices from a root degree. */
export function microChord(rootDeg, degrees, scale, baseMidi) {
  return degrees.map((d) => {
    const k = rootDeg + d;
    const oct = Math.floor(k / scale.length);
    const cents = oct * 1200 + scale[((k % scale.length) + scale.length) % scale.length];
    return midiHz(baseMidi) * Math.pow(2, cents / 1200);
  });
}

/**
 * iOS routes Web Audio through the "ambient" session, which the silent switch mutes.
 * A looping, silent <audio> element started in the same tap moves the page to the
 * media-playback session, so the music is heard with the switch on.
 */
let mediaUnlock = null;
function unlockMediaSession() {
  if (mediaUnlock) return;
  const sr = 8000, n = 800; // 0.1 s of silence, 8-bit mono WAV
  const buf = new ArrayBuffer(44 + n), v = new DataView(buf);
  const s = (o, t) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  s(0, 'RIFF'); v.setUint32(4, 36 + n, true); s(8, 'WAVE'); s(12, 'fmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr, true);
  v.setUint16(32, 1, true); v.setUint16(34, 8, true); s(36, 'data'); v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
  mediaUnlock = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
  mediaUnlock.loop = true;
  mediaUnlock.setAttribute('playsinline', '');
  mediaUnlock.play().catch(() => { /* not needed on this browser */ });
}

export class Engine {
  constructor() {
    this.started = false;
  }

  async start() {
    if (this.started) return;
    // Everything up to Tone.start() runs synchronously inside the tap, which phones require.
    // iPhone: let Web Audio play even when the ring/silent switch is on.
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* older Safari */ }
    unlockMediaSession();
    // Only high-rate devices (96 kHz desktops) get a 48 kHz context; phones keep their native rate.
    if (Tone.getContext().sampleRate > 48000) {
      try {
        const native = new AudioContext({ sampleRate: 48000, latencyHint: 'playback' });
        Tone.setContext(new Tone.Context({ context: native, lookAhead: 0.2 }));
      } catch {
        Tone.getContext().lookAhead = 0.2;
      }
    } else {
      Tone.getContext().lookAhead = 0.2;
    }
    await Tone.start();
    try { await Tone.getContext().resume(); } catch { /* already running */ }
    // Visual callbacks (legend text, ripples) must not be dropped when the tab's frames lag.
    Tone.getContext().draw.expiration = 5;
    this.limiter = new Tone.Limiter(-3).toDestination();
    this.master = new Tone.Volume(-8).connect(this.limiter);
    // Ambient, cinematic room: long tail, a little pre-delay so notes stay clear.
    this.reverb = new Tone.Reverb({ decay: 6, preDelay: 0.04, wet: 0.4 }).connect(this.master);
    await this.reverb.generate();
    this.bus = new Tone.Gain(1).connect(this.reverb); // scenes connect here
    this.dry = new Tone.Gain(0.6).connect(this.master); // for clicks that should stay close

    // Probe voice for Listen by Touch: clear sine tone, panned by position.
    this.probePan = new Tone.Panner(0).connect(this.master);
    this.probe = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.3 },
      volume: -10,
    }).connect(this.probePan);
    this.tick = new Tone.NoiseSynth({
      noise: { type: 'brown' },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0 },
      volume: -26,
    }).connect(this.probePan);

    // Earcon for "no data here" during the sweep (e.g. land under the ocean sweep).
    this.knockPan = new Tone.Panner(0).connect(this.dry);
    this.knock = new Tone.MembraneSynth({
      pitchDecay: 0.02, octaves: 2,
      envelope: { attack: 0.001, decay: 0.12, sustain: 0 },
      volume: -24,
    }).connect(this.knockPan);

    this.started = true;
  }

  setVolume(pct) {
    if (!this.master) return;
    // 0..100 → -60..0 dB, capped by the limiter for hearing safety
    this.master.volume.rampTo(pct <= 0 ? -Infinity : -40 + pct * 0.36, 0.1);
  }

  /** Soft wooden knock that marks a silent (no-data) slice of the sweep. */
  knockAt(x, time) {
    this.knockPan.pan.setValueAtTime(panOf(x), time);
    this.knock.triggerAttackRelease('C2', '32n', time, 0.4);
  }

  /** Play the touch probe: value 0..1 → microtonal pitch, x 0..1 → stereo, null → soft tick. */
  playProbe(value, x, scene) {
    if (!this.started) return;
    const now = Tone.now();
    this.probePan.pan.setValueAtTime(panOf(x), now);
    if (value == null) { this.tick.triggerAttackRelease(0.04, now); return; }
    const f = micro(value, scene.scale || MAQAM.rast, scene.base || 52, 2);
    this.probe.triggerAttackRelease(f, 0.2, now, 0.5 + value * 0.4);
  }
}
