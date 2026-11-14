#!/usr/bin/env node
// Audio QA for Polyphonic Earth recordings.
// Finds clicks / crackle, clipping, dropouts and DC offset in audio files, with timestamps.
// Usage: node tools/audio-qa.mjs assets/audio/*.flac   (needs ffmpeg on PATH)
import { execFileSync } from 'node:child_process';

const SR = 44100;
const WIN = 1024; // ~23 ms analysis window

function decode(file) {
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', 'pipe:1'], { maxBuffer: 1 << 30 });
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
}

const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, '0')}`;

function analyse(x) {
  const n = x.length;
  // 1) clipping
  let clipped = 0;
  for (let i = 0; i < n; i++) if (Math.abs(x[i]) >= 0.999) clipped++;

  // 2) clicks: a sample whose second difference is far above what the surrounding window does.
  //    Smooth music has small second differences; a discontinuity (zipper, buffer glitch) spikes it.
  const d2 = new Float32Array(n);
  for (let i = 2; i < n; i++) d2[i] = Math.abs(x[i] - 2 * x[i - 1] + x[i - 2]);
  const clicks = [];
  for (let w = 0; w + WIN <= n; w += WIN) {
    let sum = 0;
    for (let i = w; i < w + WIN; i++) sum += d2[i] * d2[i];
    const rms = Math.sqrt(sum / WIN) + 1e-6;
    for (let i = w; i < w + WIN; i++) {
      if (d2[i] > 0.02 && d2[i] > rms * 9) {
        const t = i / SR;
        if (!clicks.length || t - clicks[clicks.length - 1].t > 0.03) clicks.push({ t, size: d2[i] });
      }
    }
  }

  // 3) dropouts: sudden near-silence inside otherwise sounding audio (>= 8 ms)
  const drops = [];
  let run = 0;
  for (let i = 0; i < n; i++) {
    if (Math.abs(x[i]) < 1e-5) run++;
    else {
      if (run >= SR * 0.008 && i - run > SR * 0.5 && i < n - SR * 0.5) drops.push({ t: (i - run) / SR, ms: Math.round((run / SR) * 1000) });
      run = 0;
    }
  }

  // 4) DC offset and peak
  let dc = 0, peak = 0;
  for (let i = 0; i < n; i++) { dc += x[i]; peak = Math.max(peak, Math.abs(x[i])); }
  return { seconds: n / SR, clipped, clicks, drops, dc: dc / n, peakDb: 20 * Math.log10(peak + 1e-12) };
}

let failed = false;
for (const file of process.argv.slice(2)) {
  const r = analyse(decode(file));
  const perMin = (r.clicks.length / r.seconds) * 60;
  const verdict = r.clipped > 0 || perMin > 6 || r.drops.length ? 'CHECK' : 'OK';
  if (verdict !== 'OK') failed = true;
  console.log(`\n${file}  [${verdict}]`);
  console.log(`  length ${r.seconds.toFixed(1)} s · peak ${r.peakDb.toFixed(1)} dBFS · DC ${r.dc.toExponential(1)}`);
  console.log(`  clipped samples: ${r.clipped}`);
  console.log(`  clicks: ${r.clicks.length} (${perMin.toFixed(1)}/min)` + (r.clicks.length ? ' at ' + r.clicks.slice(0, 12).map((c) => fmt(c.t)).join(', ') + (r.clicks.length > 12 ? ' …' : '') : ''));
  console.log(`  dropouts: ${r.drops.length}` + (r.drops.length ? ' at ' + r.drops.slice(0, 8).map((d) => `${fmt(d.t)} (${d.ms} ms)`).join(', ') : ''));
}
process.exitCode = failed ? 1 : 0;
