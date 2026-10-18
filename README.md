# Bilal Khatib — Portfolio 2026

An immersive, interactive portfolio built from the homepage concept in
`design/reference/original-homepage-concept.png`. Everything is live UI: HTML text, real
components, procedural WebGL, and GSAP motion. The concept is never used as a background
image.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · three.js · React Three
Fiber 9 · drei · @react-three/postprocessing · GSAP 3 + ScrollTrigger.

```sh
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run lint
```

## Editing content

All personal information lives in **`content/profile.ts`**. Only real, verified details belong
there. Any list left empty (projects, skills, experience, contact) renders an honest "in
progress" panel rather than placeholder claims. In development those panels also say where to
add the data.

Not supplied yet:

- [ ] Bio paragraphs and location (`about`)
- [ ] Projects: title, summary, stack, links (`projects`)
- [ ] Skills / tools, grouped (`skills`)
- [ ] Experience / education timeline (`experience`)
- [ ] Public contact email and social links (`contact`)
- [ ] Résumé PDF (`resumeUrl`, file in `public/`)
- [ ] Production URL for canonical and Open Graph tags (`siteUrl`)
- [ ] Confirm the "Available for opportunities" badge (`availability.show`)
- [ ] Optional **verified** stats for the hero (`stats`). The concept's "3+ years / 10+
      projects" were mockup values and are intentionally not shown.

## How the hero is built

The layers run back to front:

| Layer | Implementation |
| --- | --- |
| Base | CSS gradients + `dark-cyber-grid.svg`, `perspective-floor.svg`, `particle-overlay.svg` (also the no-WebGL look) |
| Backdrop canvas | `components/three/hero-backdrop.tsx`: portal ring (HDR shader + bloom), dashed orbits, dark backplate disc, fresnel moon, procedural rocks, reflective floor, red neon strips, particles, server-rack silhouettes |
| Portrait | `components/hero/portrait.tsx`: graded cutout as a real `<img>` (the LCP element), CSS rim lights from matte masks, light wrap, a dark "echo" silhouette for the concept's statue |
| Panels | HUD with generated dotted world map and animated arcs; terminal that types `whoami`. Perspective-tilted HTML on desktop, collapsible on small screens |
| Cards | Six glass cards. On capable devices each gets a real 3D object (cube cluster + cloud, laptop, shield, gears, API cubes, project panels); otherwise the package's SVG art |
| Overlay canvas | `components/three/overlay-stage.tsx`: one fixed transparent canvas *above* the page, with drei `<View>`s tracking DOM slots (cards, foreground rocks, Security globe) |

The portal is locked behind the head at any viewport size: invisible anchor boxes in the
portrait (`[data-anchor]`) are projected into world space every frame
(`components/three/use-dom-anchor.ts`).

### Device tiers (`lib/device.ts`)

- **high:** full backdrop (bloom, reflections) + overlay canvas.
- **mid** (touch, narrow, ≤4 cores/GB): simplified backdrop, SVG card art.
- **low** (no WebGL, Save-Data, ≤2 GB): CSS/SVG only.

`PerformanceMonitor` downgrades at runtime if the frame rate drops. Force a tier with
`?quality=low|mid|high`. The canvases pause when off-screen, and the overlay mounts on idle.

### Motion

- **Intro:** GSAP timeline at 0.7–1.1 s per element; panels and cards arrive separately. A
  4 s wall-clock deadline guarantees content is never left hidden.
- **Cursor parallax:** fine pointers only, ≤3° on the camera.
- **Scroll:** layered scroll-out of the hero; the Security section is pinned only on large
  landscape screens.
- **Reduced motion:** reduced motion is fully respected (static frames, no pinning, no
  typing).

## Assets

- `design/reference/`: the original concept and art-direction board (reference only).
- `design/source/bilal-original.jpg`: the original portrait.
- `design/package-docs/`: the asset package's docs, tokens, and starter CSS.
- `public/images/portrait/`: the cutout. See `scripts/portrait/README.md`.
- `public/images/generated/world-dots.svg`, `public/data/land-points.json`,
  `lib/generated/hud-map.json`: produced by `node scripts/generate-world-dots.mjs`.
- `app/icon.svg` / `components/ui/monogram.tsx`: a BK monogram in the package's style. The
  package's `bk-monogram.svg` actually draws "KK".

Fonts (Space Grotesk, Inter, JetBrains Mono, Architects Daughter) are self-hosted at build
time via `next/font`. No runtime requests go to third-party CDNs; 3D lighting uses a
procedural `RoomEnvironment` instead of downloaded HDRs.
