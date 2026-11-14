// NASA POWER (power.larc.nasa.gov): real measured/modelled values for any point on Earth.
// Used by Listen by Touch to show the actual number behind a colour, and by the Caspian scene.

const BASE = 'https://power.larc.nasa.gov/api/temporal';
const cache = new Map();

async function getJSON(url, ms = 6000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error(`POWER ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Long-term climatology (1981–2020 mean) at a point, rounded to a 1° cell so nearby
 * touches reuse one request. Returns { t2m, precip } or null if the service is unreachable.
 */
export async function climateAt(lat, lon) {
  const la = Math.round(lat), lo = Math.round(lon);
  const key = `${la},${lo}`;
  if (cache.has(key)) return cache.get(key);
  const p = getJSON(`${BASE}/climatology/point?parameters=T2M,PRECTOTCORR&community=RE&latitude=${la}&longitude=${lo}&format=JSON`)
    .then((j) => {
      const prm = j.properties.parameter;
      const t = prm.T2M?.ANN, pr = prm.PRECTOTCORR?.ANN;
      return t == null || t < -900 ? null : { lat: la, lon: lo, t2m: t, precip: pr };
    })
    .catch(() => null);
  cache.set(key, p);
  return p;
}

/** Yearly mean air temperature series for a point; falls back to a bundled copy. */
export async function yearlySeries(lat, lon, fallbackUrl) {
  try {
    const j = await getJSON(`${BASE}/monthly/point?parameters=T2M,PRECTOTCORR&community=RE&latitude=${lat}&longitude=${lon}&start=1981&end=2024&format=JSON`, 8000);
    const t = j.properties.parameter.T2M, p = j.properties.parameter.PRECTOTCORR;
    const years = Object.keys(t).filter((k) => k.endsWith('13')).map((k) => +k.slice(0, 4));
    return { live: true, years, t2m_c: years.map((y) => t[`${y}13`]), precip_mm_day: years.map((y) => p[`${y}13`]) };
  } catch {
    const j = await fetch(fallbackUrl).then((r) => r.json());
    return { live: false, ...j };
  }
}
