# Polyphonic Earth

NASA Space Apps 2026 — "The Earth Information Jukebox" challenge. Team: Open Guys AI (Mingachevir local event).
**Submission deadline: 2026-11-15 23:59 Baku time.** Full plan: `PLAN.md`. Team task split: `TEAM_TASKS.md`.

## What it is
A browser web app that sonifies NASA Earth Information Center (EIC/SVS) visualizations in real time:
4 scenes (Ocean, Night Lights 2012→2023, Lightning, CO₂ & Aerosols), each with its own instrument language,
plus Listen-by-Touch, Time Machine slider, stereo mapping, and a "What am I hearing?" legend.

## Rules
- **Every file in the repo is written in English** (UI, README, PLAN, TEAM_TASKS, docs, submission text). Chat with the user in Azerbaijani.
- Vanilla HTML/CSS/JS ES modules + Tone.js from CDN with an exact pinned version. No build step.
- Accessibility is a core judging theme: everything keyboard-operable, `aria-live` descriptions, reduced-motion support, volume capped.
- Pitch: quarter-tone maqam scales (`MAQAM` in js/engine.js) with ±25-cent data bends (`micro()`); never output raw pixel noise.
- Sound design: ambient/cinematic; sound legend (lowest + highest value) before music; layers enter one at a time; 8-step sweep per bar.
- Brand: P = treble clef + Earth mark (`assets/logo.svg`), Figma file S2UyxFcnpmDOgDDvK0LY5M (pages: cover, Brand). Night + Day palettes.
- FLAC recordings of each scene live in `assets/audio/` (rendered from the app, loudness-normalised to -16 LUFS, 16-bit/44.1 kHz).
- Every NASA asset gets a credit line (SVS page URL) in the UI and README.
- Deploy target: GitHub Pages. Keep assets small (low-res MP4/JPG).
- Prefer 3 polished scenes over 4 rough ones if time runs short.
- Git commits: NEVER add `Co-Authored-By: Claude` or any Claude/AI attribution trailer to commit messages or PR bodies (user's explicit instruction).

## Skills
Project skills in `.claude/skills/`: `tonejs`, `ui-sound-design`, `audio-analysis`.
