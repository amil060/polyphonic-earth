// Frame analyzer: draws a NASA visualization frame into a small hidden canvas
// and turns pixels back into data values using the active scene's colour rules.

export const GRID_W = 192;
export const GRID_H = 96;

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}

export class Analyzer {
  constructor(w = GRID_W, h = GRID_H) {
    this.w = w; this.h = h;
    this.canvas = document.createElement('canvas');
    this.canvas.width = w; this.canvas.height = h;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.values = new Float32Array(w * h); // NaN = no data
    this.prevValues = new Float32Array(w * h);
    this.ready = false;
  }

  /** Read one frame and convert every pixel into a data value with scene.value(). */
  capture(media, scene, crop) {
    const { ctx, w, h } = this;
    try {
      if (crop) ctx.drawImage(media, crop.x, crop.y, crop.w, crop.h, 0, 0, w, h);
      else ctx.drawImage(media, 0, 0, w, h);
    } catch { return false; }
    const px = ctx.getImageData(0, 0, w, h).data;
    this.prevValues.set(this.values);
    for (let i = 0, p = 0; i < w * h; i++, p += 4) {
      const v = scene.value(px[p], px[p + 1], px[p + 2]);
      this.values[i] = v == null ? NaN : v;
    }
    this.ready = true;
    return true;
  }

  valueAt(fx, fy) {
    const x = Math.min(this.w - 1, Math.max(0, Math.floor(fx * this.w)));
    const y = Math.min(this.h - 1, Math.max(0, Math.floor(fy * this.h)));
    // average a 3x3 neighbourhood so single noisy pixels don't dominate
    let sum = 0, n = 0, total = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= this.w || yy >= this.h) continue;
      total++;
      const v = this.values[yy * this.w + xx];
      if (!Number.isNaN(v)) { sum += v; n++; }
    }
    return n / total < 0.34 ? null : sum / n;
  }

  /**
   * Split the map into vertical slices (west → east).
   * Each slice reports mean value, coverage (fraction of pixels with data),
   * peak value and the latitude centroid (0 = top/north, 1 = bottom/south) of the data.
   */
  columns(n = 16) {
    const { w, h, values } = this;
    const out = [];
    const sw = w / n;
    for (let c = 0; c < n; c++) {
      const x0 = Math.floor(c * sw), x1 = Math.floor((c + 1) * sw);
      let sum = 0, cnt = 0, peak = 0, ySum = 0, wSum = 0;
      for (let y = 0; y < h; y++) {
        for (let x = x0; x < x1; x++) {
          const v = values[y * w + x];
          if (Number.isNaN(v)) continue;
          sum += v; cnt++;
          if (v > peak) peak = v;
          ySum += y * v; wSum += v;
        }
      }
      const area = (x1 - x0) * h;
      out.push({
        index: c,
        x: (c + 0.5) / n,
        mean: cnt ? sum / cnt : 0,
        coverage: cnt / area,
        peak,
        energy: sum / area,
        lat: wSum > 0 ? ySum / wSum / (h - 1) : 0.5,
      });
    }
    return out;
  }

  /** Global statistics for descriptions and drones. */
  stats() {
    const { values, prevValues } = this;
    let sum = 0, cnt = 0, motion = 0, mcnt = 0, north = 0, south = 0;
    const half = (this.h / 2) * this.w;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (Number.isNaN(v)) continue;
      sum += v; cnt++;
      if (i < half) north += v; else south += v;
      const pv = prevValues[i];
      if (!Number.isNaN(pv)) { motion += Math.abs(v - pv); mcnt++; }
    }
    return {
      mean: cnt ? sum / cnt : 0,
      coverage: cnt / values.length,
      energy: sum / values.length,
      motion: mcnt ? motion / mcnt : 0,
      north, south,
    };
  }
}
