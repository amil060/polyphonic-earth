# 🌍🎵 Polyphonic Earth

![Polyphonic Earth: NASA Earth visualizations played as live music](assets/cover.png)

**Hear our planet change.** Polyphonic Earth **makes NASA Earth data accessible through sound.** It is an *Earth Jukebox* that turns NASA Earth Information Center (EIC) and NASA SVS visualizations into live music in the browser, so anyone can explore Earth science with their ears, including people who are blind or have low vision.

Built for the **2026 NASA Space Apps Challenge**, challenge *"The Earth Information Jukebox"*, by team **Open Guys AI** (Mingachevir, Azerbaijan).

> **Live demo:** https://amil060.github.io/polyphonic-earth/ · **Code:** https://github.com/amil060/polyphonic-earth · **Demo video (30 s):** _add link here_

---

## The problem
NASA's Earth Information Center publishes striking visualizations of a changing planet, but they speak only to the eyes. More than 2.2 billion people live with a vision impairment (WHO). For them, and for anyone who learns better by listening, these stories stay locked inside the image.

## Our solution
Pick a scene and press play. The app reads every frame of the NASA visualization **in real time**, converts the pixel colours back into data values using the visualization's own colour scale, and plays that data as music.

| Scene | NASA data | What you hear |
|---|---|---|
| 🌊 **Ocean** | ECCO2 sea surface currents & temperature | A west→east sweep melody: warm water sings high, cold water low, land is silent. The pad chord brightens as the ocean warms. Faster currents shimmer. |
| 🌃 **Night Lights 2012→2023** | VIIRS Black Marble | City lights ring as bells, pitched by latitude. A **Time Machine** steps through the years, and a bass drone climbs as the world grows brighter. *Change* mode plays rising chimes where light grew and falling tones where it dimmed. |
| ⚡ **Lightning** | ISS Lightning Imaging Sensor 2017–2023 | Every slice with flashes hits a drum. Tropical storms boom low, storms far from the equator sound higher. Rain noise swells with global storm activity. |
| 🇦🇿 **Caspian & Mingachevir** | NASA POWER 1981–2024 + NASA GIBS MODIS | Our home region: one note per year of measured air temperature in Mingachevir over a low drone at the 1980s average. The melody climbs as the region warms (about +1.4 °C in the last decade vs the 1980s). |
| 🏭 **CO₂** | DYAMOND GEOS carbon dioxide | A calm chord gains tritones and clashing seconds as CO₂ plumes intensify. The filter opens with concentration, and a gritty melody traces strong plumes. |

### How the music works
- **Sound legend first.** Every scene opens by playing its lowest and its highest value once, like the axis of a chart, while a marker moves on the colour scale. Then the music starts.
- **One layer at a time.** The melody plays alone, and harmony, bass and texture join every two bars. Each layer can be switched on or off.
- **A slow sweep.** Eight west-to-east slices per bar, long ambient notes, and a soft knock for slices with no data (land, in the ocean scene).
- **Microtonal maqam tuning.** Notes use quarter-tone maqam scales (Rast, Saba, Hijaz). The value picks a scale degree and the remainder bends the note by up to ±25 cents, so small differences in the data stay audible. In the CO₂ scene two copies of the chord drift apart in cents as concentration rises, and you hear them beat.

### Does the sound tell the truth?
We measured it. Every number below comes from the app's own data and code; nothing is estimated by ear.

| Check | Data | Result |
|---|---|---|
| **Mingachevir warming** | NASA POWER annual mean air temperature, 1981–2024 | 1981–1990 average **14.35 °C**, 2015–2024 average **15.71 °C**: **+1.36 °C**. All of the last 10 years are above the 1980s average. Linear trend +0.44 °C per decade. |
| **…and the melody** | The same series through the app's pitch mapping (Rast maqam, 2 octaves) | The 2015–2024 notes sit on average **994 cents (about 10 semitones) higher** than the 1980s notes. The mapping is monotonic: a warmer year never plays a lower note (checked for every pair of the 44 years). |
| **Night lights 2012 → 2023** | Total detected light in the VIIRS Black Marble frames, measured by the app | **+69 %** over the period (2013 +4 %, 2017 +20 %, 2021 +28 %, 2022 +55 %, 2023 +69 %). The jump in 2022 may partly come from changes in the yearly composites, so we treat it as relative brightness, not official radiance. |
| **Ocean temperature order** | ECCO2 colours decoded at known places, averaged over 17 frames | Decoded values (0 = coldest colour, 1 = warmest): West Pacific warm pool 0.89, Arabian Sea 0.90, Gulf Stream 0.58, North Atlantic 0.34, Southern Ocean 0.20. Against typical annual sea surface temperatures (about 29, 27.5, 22, 10 and 1 °C), **9 of 10 pairs are in the right order**; the one miss (warm pool vs Arabian Sea) differs by 0.01. The eastern equatorial Pacific had too few coloured pixels to read. |

Limits: ocean and CO₂ values are positions on each visualization's colour scale, not °C or ppm, and both are model output (ECCO2, GEOS). Mingachevir values are MERRA-2 reanalysis for the grid cell around the city, not a single weather station.

### Recordings
Each scene rendered by the app, sound legend and layer intro included, as lossless FLAC: [ocean](assets/audio/ocean.flac) · [night lights](assets/audio/nightlights.flac) · [lightning](assets/audio/lightning.flac) · [CO₂](assets/audio/co2.flac) · [Caspian & Mingachevir](assets/audio/caspian.flac).

### Theme song
The start screen has an optional theme song, **"Polyphonic Earth"**, an original composition by our teammate **Ali Aliyev** ([theme.m4a](assets/audio/theme.m4a), 48 s). It plays only when you press its button and fades out as soon as you enter the map, so it never plays over the data.

### Signature features
- **60-second tour:** one button plays all five scenes for about ten seconds each and ends with the full Mingachevir scene and its summary. Escape, Pause or Stop tour hand control back to you.
- **Each scene introduces itself:** a one-line, first-person narrator ("I am the ocean…") appears over the map in the interface language, goes to screen readers, and is spoken aloud when spoken descriptions are on.
- **Listen by Touch:** move a mouse or finger over the map, or use the arrow keys. The value under the cursor plays as a pitched tone, panned to its position, and a screen reader announces the approximate location and value. Pause for a moment and the app sends a **live request to the NASA POWER API** for that point and reads out its 1981–2020 average air temperature and rainfall; a red LIVE badge marks the answer.
- **Stereo map:** in every scene, west sounds on the left and east on the right.
- **Time Machine:** hear 12 years of human light. The app also *measures* total detected light per year from the NASA frames and charts it.
- **"What am I hearing?":** a legend that explains every sound layer, plus live descriptions on demand.
- **Musical, not noisy:** every note is snapped to a quarter-tone maqam scale with a small data bend, so the data stays listenable.
- **Plays once, then explains:** each scene stops at the end and shows what you heard and why it matters, with its sources.

## Accessibility
**What we tested ourselves:** keyboard-only use of every control; automated checks for contrast (lowest text 5.05:1 on the background, WCAG AA), accessible names, heading order, 24 px minimum targets and no horizontal scrolling from 320 px to 1920 px; mono output; the visual-only mode. **Not yet verified:** a full session with a screen-reader user and NVDA/VoiceOver on real devices. That is our next step, not a claim.

**For deaf and hard-of-hearing visitors:** "Explore without sound" plays the map without audio. During playback the marker on the colour scale jumps to the pitch of each note, ripples show where each note comes from and how strong it is, and the oscilloscope under the map draws the rhythm of the notes.

- Fully keyboard-operable: `1`–`5` scenes, `Space` play/pause, `T` Listen by Touch, arrow keys explore, `D` describe, `[` `]` years, `-` `=` volume, `H` help.
- `aria-live` descriptions written for screen readers, a proper tab pattern, visible focus, 24 px minimum targets (most controls 36–44 px).
- Interface in four languages: English, Azerbaijani, Spanish and Russian (start screen, controls, sound legend and the plain-language listening guide). The choice is saved on the device. Detailed science panels and generated descriptions stay in English.
- Respects `prefers-reduced-motion`. Output passes through a limiter for hearing safety.
- Responsive from phone to desktop.

## How it works
```
NASA frame (video/image) ──► hidden <canvas> 192×96 ──► pixel → data value (scene colour rules)
        │                                                   │
        │                                    8 west→east slices: mean, coverage, peak, latitude
        ▼                                                   ▼
   on-screen visual                     Tone.js transport (8 steps per bar) 
   + sweep overlay                      onStep → note (pitch=value, loudness=coverage, pan=x)
                                        onBar  → chords / drones / textures from global stats
```
Colour rules were **calibrated against the real SVS frames**. For example, Black Marble city lights are dim warm pixels (≈ rgb 37,36,18) on a near-black map, ISS lightning flashes are yellow-green dots, and the ECCO2 temperature scale runs blue → green → yellow → red.

**Stack:** vanilla HTML/CSS/JavaScript (ES modules), [Tone.js 14.7.77](https://tonejs.github.io/), no build step. Hosted on GitHub Pages.

```
index.html  css/style.css
js/main.js        app controller, transport, Listen by Touch, keyboard
js/analyzer.js    frame → data grid, slices, global stats
js/engine.js      master chain, scales, probe voice
js/scenes/*.js    one file per scene: colour rules + instruments + descriptions
assets/data/      NASA media (downscaled copies)
```

### Audio quality check
`node tools/audio-qa.mjs assets/audio/*.flac` scans recordings for clicks, clipping, dropouts and DC offset and prints timestamps. We used it to find and remove crackle: pan jumps under ringing notes, drum hits cutting off their own tails, and a gain envelope that snapped to zero.

### Run locally
```bash
python -m http.server 8123
```
Then open http://localhost:8123. A local server is needed because browsers block pixel reads on `file://` pages.

## Data & credits
All visualizations: **NASA/Goddard Space Flight Center Scientific Visualization Studio (SVS)**. Three of them are made for the NASA Earth Information Center (EIC) display; the ocean scene uses a standard SVS visualization. Media files here are downscaled copies for web delivery.
- Change in Night Lights between 2012 and 2023, EIC Version: https://svs.gsfc.nasa.gov/5313/
- Lightning Events Detected from the ISS 2017–2023 (EIC display): https://svs.gsfc.nasa.gov/5011/
- DYAMOND Global Carbon Dioxide (EIC display): https://svs.gsfc.nasa.gov/5196/
- Global Sea Surface Currents and Temperature (ECCO2, NASA SVS): https://svs.gsfc.nasa.gov/3912/
- NASA POWER (MERRA-2) yearly air temperature and rainfall for Mingachevir, and point climatology for Listen by Touch: https://power.larc.nasa.gov/
- NASA GIBS, MODIS Terra corrected reflectance of the Caspian region (15 July 2023): https://gibs.earthdata.nasa.gov/
- Caspian sea-level context in the Caspian summary: Chen, J. L. et al. (2017), Long-term Caspian Sea level change, *Geophysical Research Letters*, doi:10.1002/2017GL073958
- Inspiration: NASA "Data Sonification: Caldwell 73": https://svs.gsfc.nasa.gov/13786/

**Music:** start-screen theme "Polyphonic Earth" © 2026 Ali Aliyev, used with permission.

**Software:** Tone.js (MIT). Fonts: IBM Plex Sans and IBM Plex Mono (Google Fonts, OFL).

## Use of AI
We used one AI tool, Anthropic Claude, as a coding assistant. The team made the decisions and checked what it produced.
- **Code:** the assistant wrote most of the HTML, CSS and JavaScript, the Tone.js instruments and the audio quality-check script, following the team's design and sound decisions.
- **Data work:** it wrote the scripts that sample the NASA frames to calibrate the colour rules, and the measurements in "Does the sound tell the truth?". The team chose the datasets and checked the results against the sources.
- **Text:** it drafted the README, the interface text and the Azerbaijani, Spanish and Russian translations, which the team reviewed.
- **Images and music:** the logo and cover were drawn as vector shapes from the team's brief; no image-generation model was used. The theme song is a human composition by Ali Aliyev. All sound in the scenes is synthesised live from the data.
- **Testing:** the assistant ran automated accessibility and layout checks; the team tested on their own phones and computers.

## Team
**Open Guys AI**, NASA Space Apps 2026, Mingachevir local event.
