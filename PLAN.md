# Polyphonic Earth: Winning Plan

**Challenge:** NASA Space Apps 2026 · *The Earth Information Jukebox*
**Team:** Open Guys AI · Local event: Mingachevir
**Deadline:** **November 15, 2026, 23:59 (Baku time)**

---

## 1. One-sentence idea
> **Polyphonic Earth**: a web jukebox that turns NASA's Earth visualizations into real-time music, so blind and low-vision people can "see" our changing planet with their ears.

## 2. Judging criteria and how we answer them

| Criterion (1–5) | How we score a 5 |
|---|---|
| **Impact** | The target audience is the 2.2+ billion people living with a vision impairment (WHO). Full keyboard and screen-reader support, plus "Listen by Touch" lets people explore the map by ear. |
| **Creativity** | Each dataset speaks its own "instrument language", combined with a Time Machine, a stereo map and touch listening. This goes well beyond a plain "pixel → note" approach. |
| **Validity** | Frames are analysed in the browser in real time (canvas → pixels → audio parameters). Colour rules are calibrated against the real NASA frames, so the sound carries the correct scientific meaning. Notes are snapped to musical scales to avoid noise. |
| **Relevance** | All scenes are EIC/SVS visualizations; NASA data is the core of the project. Every scene shows its source and credit. |
| **Presentation** | 30-second demo video (with sound and English subtitles), a "How it works" section in the README, and a live link. |

**Target global awards:** 1) Art & Technology · 2) Best Use of Data · 3) Most Inspirational. The Caspian & Mingachevir scene is our strongest card for the local judges.

## 3. Product: what we built

### 3.1 Scenes (5 datasets → 5 instrument languages)

| Scene | NASA source | Visual feature → Sound |
|---|---|---|
| 🌊 **Ocean** | [Sea Surface Currents & Temperature](https://svs.gsfc.nasa.gov/3912/) | Temperature colour → sweep melody pitch (warm = high, cold = low, land = silence) · global warmth → pad chord from minor to major · current motion → filter shimmer |
| 🌃 **Night Lights 2012→2023** | [Change in Night Lights](https://svs.gsfc.nasa.gov/5313/) | **Time Machine** slider across the years · city lights → bells, pitched by latitude · light growth vs 2012 → rising bass drone · Change mode: brighter = rising chimes, darker = falling tones |
| ⚡ **Lightning (ISS)** | [Lightning Events 2017–2023](https://svs.gsfc.nasa.gov/5011/) | Each slice with flashes → drum hit · distance from equator → drum pitch · longitude → stereo · global storm activity → rain noise |
| 🇦🇿 **Caspian & Mingachevir** | [NASA POWER](https://power.larc.nasa.gov/) 1981–2024 + NASA GIBS MODIS image | One note per year of measured air temperature in Mingachevir over a drone at the 1980s average · the melody climbs as the region warms (+1.36 °C) |
| 🏭 **CO₂** | [DYAMOND CO₂](https://svs.gsfc.nasa.gov/5196/) | CO₂ concentration → increasing dissonance (tritone, minor second, cluster) · average level → filter brightness · strong plumes → gritty melody · plume coverage → low haze rumble |

### 3.2 Features in every scene
1. **Jukebox Play**: the visualization plays and frame analysis generates music in real time.
2. **Listen by Touch**: moving the mouse, a finger or the arrow keys over the map plays the value at that point as a tone, panned to its position.
3. **Time Machine**: year slider (Night Lights).
4. **"What am I hearing?"**: a legend explaining every sound layer, plus `aria-live` descriptions for screen readers.

### 3.3 Accessibility (required)
- Everything works with the keyboard alone (Tab, Space, arrow keys, 1–5 to pick a scene).
- `aria-live` descriptions, high contrast, `prefers-reduced-motion` support.
- Sound safety: volume cap through a limiter, soft start.

## 4. Technical architecture
- **Stack:** vanilla HTML/CSS/JS (ES modules) + **Tone.js 14.7.77** (CDN, pinned). No build step: fast and reliable.
- **Analysis:** `<video>`/`<img>` → hidden `<canvas>` (192×96 grid) → per-pixel data values → 8 west-to-east slices (mean, coverage, peak, latitude).
- **Sound engine:** one file per scene with its own instrument rules. All notes are quantized to quarter-tone maqam scales with a ±25-cent data bend.
- **Data:** downscaled MP4/JPG copies from SVS stored in the repo (NASA material, credited). Avoids CORS issues and works offline for the demo.
- **Hosting:** GitHub Pages.

```
index.html
css/style.css
js/main.js          # UI, scene switching, transport, Listen by Touch, keyboard
js/analyzer.js      # frame → data grid, slices, global stats
js/engine.js        # Tone.js master chain, scales, probe voice
js/scenes/{ocean,nightlights,lightning,co2}.js
assets/data/...     # NASA frames and videos
README.md           # story, mapping table, credits, AI use
```

## 5. Timeline

| When | Work |
|---|---|
| **Nov 14, evening** | ✅ Data download & preparation · app skeleton · analyzer · audio engine · all 5 scenes · Listen by Touch · README |
| **Nov 15, morning** | Sound tuning after listening tests · accessibility testing with NVDA · fixes from Issues |
| **Nov 15, afternoon** | Design polish · deploy to GitHub Pages |
| **Nov 15, 16:00–20:00** | 30-second demo video · README "Our story" · submission text |
| **Nov 15, by 22:00** | **Submit** (leaves a 1–2 hour buffer) |

**Cut rule:** if time runs short, polish beats scope. Three polished scenes are better than four rough ones.

## 6. Presentation (30-second video)
- 0–4 s: black screen and sound. Subtitle: *"2.2 billion people can't see NASA's maps of our planet."*
- 4–8 s: a hand on the screen, Listen by Touch (footage from the user test if we have it).
- 8–22 s: the scenes, about 3 s each: Ocean → Night Lights (Time Machine) → Lightning → CO₂ → **Mingachevir (+1.4 °C)**.
- 22–27 s: the test user's one-sentence quote (subtitled), only with their written consent.
- 27–30 s: logo, link, "Powered by NASA data". No copyrighted music: only the app's sound and Ali Aliyev's theme.
- English subtitles (required by the rules).

## 7. Submission checklist
- [ ] All team members are registered for the Mingachevir event and appear on the Members tab
- [ ] All fields on the Project Submission page are filled in, in English
- [ ] Demo: 30-second video (or 7 slides)
- [ ] Live link + GitHub repo
- [ ] **References:** NASA SVS pages, Tone.js (MIT), fonts, project skills used
- [ ] **AI use disclosed** (README "Use of AI" section)
- [ ] Both checkboxes (terms and originality) ticked → **Submit**

## 8. Installed skills
- Project (`.claude/skills/`): `tonejs` · `ui-sound-design` · `audio-analysis` (all MIT, reviewed before install)
- Global: `frontend-design-direction` · `frontend-a11y` · `browser-qa` · `remotion-video-creation` · `dataviz`
