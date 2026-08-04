# Vegan Camp Out — Timeline Planner

An unofficial, fan-made schedule planner for Vegan Camp Out. Every stage on one scrollable timeline, heart your favourites, and spot clashes at a glance. Built as a single static page — no backend, no accounts, no tracking.

**Live site:** _add your GitHub Pages URL here once deployed_

## Features

- **Timeline and list views** — see every stage as parallel lanes on a shared time axis, or switch to a stage-by-stage list.
- **Filters** — narrow by stage and by type (talks, live music, DJ/party, wellness, family & teens, activities). A badge shows when filters are active.
- **Faves** — heart any event; favourites are saved on your device and persist between visits.
- **Clash detection** — if two of your faves overlap, both are flagged and the detail sheet tells you exactly what clashes.
- **Light / dark mode** — remembered between visits.
- **Works offline** — after the first load, the app opens and runs with no signal (handy in a field).
- **Add to home screen** — installs as a lightweight app on phones.

## Files

| File | What it is |
|------|------------|
| `index.html` | The entire app — markup, styles, schedule data and logic in one file. |
| `sw.js` | Service worker that handles offline caching. |
| `manifest.webmanifest` | Lets people install the planner to their home screen. |

## Editing the schedule

All event data lives in the `RAW` array inside `index.html`. Each row is:

```
[day, stage, start, end, title, subtitle, typeOverride?]
```

- `day` — `"THU"`, `"FRI"`, `"SAT"` or `"SUN"`
- `stage` — one of the keys in the `STAGES` object (e.g. `"main"`, `"jungle"`, `"mb"`)
- `start` / `end` — 24-hour time as `"HH.MM"` (e.g. `"20.45"`). Times past midnight roll over automatically.
- `title` / `subtitle` — the act or session and any supporting line
- `typeOverride` — optional; only needed when an event's type differs from its stage's default

## Important: after any change, bump the cache version

Whenever you edit the schedule or the app, open `sw.js` and increase the version number:

```js
const VERSION = 'vco-planner-v7';   // → 'vco-planner-v8'
```

This clears everyone's cached copy so they get your update on their next visit. **Skipping this means people keep seeing the old version.**

## Deploying updates

The site is hosted on GitHub Pages from the `main` branch. To publish a change:

```bash
git add .
git commit -m "describe what changed"
git push
```

Pages redeploys automatically within a minute or so.

## Notes

- Times are copied from the official festival posters and can change; this planner is not affiliated with Vegan Camp Out.
- Favourites are stored per-device in the browser. Privacy-heavy browsers (e.g. Brave in strict mode) or private/incognito windows block this storage, and the app warns users when that happens.
