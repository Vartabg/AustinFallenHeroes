<div align="center">

# 🕯️ Austin Fallen Heroes

**An Interactive 3D Memorial**

*Honoring service members from Austin & Central Texas who gave the ultimate sacrifice.*

[![Three.js](https://img.shields.io/badge/Three.js-0D1117?style=flat-square&logo=threedotjs&logoColor=c9a654)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-0D1117?style=flat-square&logo=vite&logoColor=c9a654)](https://vitejs.dev)
[![JavaScript](https://img.shields.io/badge/JavaScript-0D1117?style=flat-square&logo=javascript&logoColor=c9a654)](https://developer.mozilla.org)

</div>

---

## About

An immersive 3D memorial built with Three.js. Visitors explore a twilight scene featuring a curved granite wall inscribed with the names of fallen heroes, an eternal flame with rising ember particles, and a star field overhead. Click any name to read their story.

Names are color-coded by conflict:
- 🟡 **Gold** — Operation Iraqi Freedom (OIF)
- 🔵 **Steel Blue** — Operation Enduring Freedom (OEF)
- 🟣 **Purple** — Operation Freedom's Sentinel (OFS)

## Features

- **Cinematic fly-in** — Dramatic camera animation on entry
- **Interactive wall** — Click any name to open their biographical panel
- **Eternal flame** — 200-particle fire system with 50 rising embers
- **Atmospheric lighting** — Dual-source flame glow with real-time flicker
- **Star field** — 2,000 twinkling stars in the upper hemisphere
- **Orbit controls** — Mouse/touch camera navigation
- **Mobile responsive** — Touch-friendly interaction and layout
- **Conflict color-coding** — Visual grouping by theater of operation

## Architecture

```
src/
├── main.js           # Scene orchestrator, render loop
├── environment.js    # Sky, ground, fog, lighting, stars
├── memorial.js       # Curved granite wall, name inscriptions
├── flame.js          # GPU particle system (flame + embers)
├── interaction.js    # Raycasting, orbit controls, fly-in
└── detail-panel.js   # Biographical detail overlay

data/
└── heroes.json       # Verified hero data (name, rank, unit, conflict...)
```

## Run Locally

```bash
git clone https://github.com/Vartabg/AustinFallenHeroes.git
cd AustinFallenHeroes
npm install
npm run dev
# Open http://localhost:5174
```

## Data Sources

Hero data is compiled from publicly available sources including the Defense Casualty Analysis System (DCAS), the 1st Cavalry Division Association Book of Honor, and verified press reporting.

## License

MIT

---

<p align="center"><em>"All gave some. They gave all."</em></p>
