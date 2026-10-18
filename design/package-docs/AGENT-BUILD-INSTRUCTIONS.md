# Agent implementation brief — Bilal Khatib

**Goal**: implement a live responsive website inspired by `references/original-homepage-concept.png`. The name must be **BILAL KHATIB**, not Arthur. Do not embed the reference screenshot as a live UI.

### Stack
Next.js (App Router), TypeScript, Tailwind, React Three Fiber, Drei, GSAP + ScrollTrigger. Load the WebGL scene lazily with graceful fallback.

### Main composition
- Header with BK monogram, Home / About / Projects / Security / Skills / Contact.
- Left column: HELLO I'M, large BILAL KHATIB display heading, Software Engineer & Cybersecurity Enthusiast, short tagline, two CTAs, optional VERIFIED stats only when supplied.
- Middle: actual user photo with transparency; cyan portal ring behind head, soft blue rim-light and optional CSS red highlight. Preserve user identity faithfully.
- Right: floating security HUD, terminal with `whoami`.
- Lower cards: six images in `svg/projects/`, hover-reveal titles, links.
- Footer scroll indicator + animated section progress nav.
- Sections below fold: About, Projects, Cybersecurity, Skills, Experience, Contact. Use real user details only; no invented experience years or qualifications.

### Motion
Intro fade/slide 0.7–1.1 seconds; foreground cards rise separately; portal slowly rotates; camera and portrait move with very small cursor parallax; short card hover lifts; scroll transitions have pinned sections only on larger screens. Respect reduced-motion and touch interaction.

### Responsive
Mobile should stack text, portrait, and panels; make panels collapsible; 3D simplified or disabled on low-power devices; no horizontal overflow.

### QA
Compare screenshot at 1440x900 and mobile 390x844, check contrast, route targets, FPS, hydration, keyboard and pointer input.
