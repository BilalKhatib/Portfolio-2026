# Portrait cutout pipeline

Produces the transparent portrait used in the hero from `design/source/bilal-original.jpg`.
The asset package did not include a cutout, so this pipeline makes one. The photo is never
reshaped or retouched beyond background removal. The graded variant changes tone and white
balance only.

| Output (in `public/images/portrait/`) | Use |
| --- | --- |
| `bilal-cutout.png` | Neutral master: decontaminated edge colours, original tones (About section) |
| `bilal-cutout-graded.png` | Cinematic grade for the dark hero (−0.3 EV, cooler shadows, gentle S-curve) |
| `bilal-matte.png` | 384px white+alpha matte for CSS mask layers (rim lights, echo silhouette) |

## Steps

1. **`segment.mjs`**: coarse subject mask with ISNet (`@imgly/background-removal-node`, which
   ships its model weights on npm, so it runs offline on CPU).
2. **`refine.py`**: builds a trimap from the coarse mask, with a wider unknown band across the
   hair. Thin window-frame and curtain lines are removed with a morphological opening. Then it
   runs closed-form alpha matting (`pymatting`) and ML foreground estimation, which strips the
   warm curtain colour out of the hair edges.
3. **`finalize.py`**: manual retouch of two curtain-rod fragments above the hair (coordinates
   in the script), trim, grade, and export.

## Re-running

Keep the tooling outside the repo:

```sh
TOOLS=/path/to/tools
mkdir -p $TOOLS && cd $TOOLS
npm init -y && npm install @imgly/background-removal-node@1.4.5
python3 -m venv venv && venv/bin/pip install pymatting numpy pillow scipy

cd /path/to/repo
node scripts/portrait/segment.mjs $TOOLS design/source/bilal-original.jpg /tmp/mask.pgm
$TOOLS/venv/bin/python scripts/portrait/refine.py design/source/bilal-original.jpg /tmp/mask.pgm /tmp/cutout
python3 scripts/portrait/finalize.py /tmp/cutout.png public/images/portrait
```

The run is deterministic: re-running reproduces the committed files pixel for pixel.

To use a different photo, replace the source image and re-run. If the background differs, the
retouch rectangles in `finalize.py` will probably need adjusting or removing. The anchor
percentages for the portal ring in `components/hero/hero.module.css` (`.ringAnchor`,
`.discAnchor`) are tuned to this photo's head position.
