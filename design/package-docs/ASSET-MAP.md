# Bilal Khatib — asset map

## Hero visual layering (back to front)
1. `svg/backgrounds/dark-cyber-grid.svg` full-bleed behind charcoal CSS overlay.
2. `svg/backgrounds/perspective-floor.svg` low-opacity bottom layer.
3. `svg/backgrounds/particle-overlay.svg` with subtle independent parallax.
4. `svg/backgrounds/neon-portal-ring.svg` positioned behind subject and animated with very slow rotation.
5. **Bilal portrait**: use `portrait/bilal-original.jpg` as reference. Cut out the subject in photo editing software to obtain a separate `bilal-cutout.png`; this package does not pretend to include a perfect alpha cutout.
6. `svg/ui/security-hud.svg` and `svg/ui/terminal-window.svg` floating foreground panels.
7. HTML hero name, job titles, CTA buttons; not rasterized.
8. Six `svg/projects/*.svg` project feature cards.

## What is NOT embedded in the screenshot
The original mockup is a single flattened raster image. It contains **no actual 3D meshes, 3D materials, animation curves, source fonts, or independently layered originals**. SVG graphics in this kit are newly created matching-style approximations, not original extracted layers. For real 3D orbiting rocks, realistic reflective platform, and depth-reactive portal, model procedural geometry with Three.js/React Three Fiber or source genuine GLB models.

## Licensing
Your supplied portrait and the generated reference images are provided for your own project. All SVGs, procedural texture, and implementation guide in this archive were created for this package. Fonts are names/recommendations; font binaries are not bundled.
