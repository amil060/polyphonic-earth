# Team Tasks: Polyphonic Earth

**Deadline:** November 15, 2026, 23:59 (Baku time). Everyone should finish their part **by 20:00**.

Each member pushes their own work to the repo **from their own computer, with their own GitHub account**.

---

## 👤 Member 1: Project lead
- [ ] Run the app locally and check all 5 scenes
- [ ] Create the GitHub repo and add teammates as **Collaborators**
- [ ] Enable GitHub Pages (Settings → Pages → Branch: `main`, folder `/root`)
- [ ] Fill in the **Project Submission** form on the Space Apps site (in English)
- [ ] Check that every team member appears on the **Members** tab

## 🎧 Member 2: Sound & accessibility testing
- [ ] Listen to each scene with headphones for at least 2 minutes. Note any sound that is unpleasant or too loud
- [ ] Install the **NVDA** screen reader (free, nvaccess.org) and use the app with your eyes closed, keyboard only:
  - Can you reach every button with `Tab`?
  - Can you press `T` and "listen" to the map with the arrow keys?
  - Is the description read aloud when you press `D`?
- [ ] **User test (most important):** ask one blind or low-vision person to try the app for 10 minutes (Plan B: a teammate, blindfolded), with VoiceOver (iPhone) or TalkBack (Android):
  - Can they go from the start screen to the map?
  - Can they start the Ocean scene? Do they understand the sound legend (lowest and highest note)?
  - With Listen by Touch, can they find warm and cold places with a finger?
  - In the Mingachevir scene, do they hear the temperature rising?
  - Is the end-of-scene summary read out?
  - Ask for one sentence about the experience, with written consent (name or anonymous)
- [ ] Report what you find as GitHub **Issues** (Issues → New issue)
- [ ] Write a `TESTING.md` file: what you tested, how, and the results (10–15 lines). Commit and push it

## 🎬 Member 3: Story & demo video
- [ ] Record the 30-second demo video (screen recording + app audio). The script is in section 6 of [PLAN.md](PLAN.md):
  - 0–4 s: black screen and sound: *"2.2 billion people can't see NASA's maps of our planet."*
  - 4–8 s: a hand on the screen, Listen by Touch
  - 8–22 s: the 5 scenes, about 3 s each, ending on Mingachevir (+1.4 °C)
  - 22–27 s: the test user's quote (with consent)
  - 27–30 s: logo + link + "Powered by NASA data"
- [ ] Add **English subtitles** (required by the rules)
- [ ] Upload the video to YouTube (Unlisted) or Google Drive and add the link to the README
- [ ] Write the "Our story" section of the README: why did you choose this project? (3–5 sentences)

---

### How to upload a file to GitHub (easiest way)
1. Open the repo on GitHub → **Add file → Upload files**
2. Drag and drop the file → write a short description below → **Commit changes**

Or from the terminal:
```bash
git clone <repo-url>
cd <repo-name>
# add / edit the file
git add TESTING.md
git commit -m "Add accessibility test notes"
git push
```
