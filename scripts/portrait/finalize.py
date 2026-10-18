"""Retouch + grade + export the refined cutout.

Outputs (trimmed to the subject's bounding box, same scale as the source photo):
  bilal-cutout.png         neutral master: decontaminated colours, untouched tones
  bilal-cutout-graded.png  cinematic grade for the dark hero (tone/white balance only)
  bilal-matte.png          small white+alpha matte for CSS mask layers (rim light, echo)
"""
import sys
import numpy as np
from PIL import Image

src, out_dir = sys.argv[1:3]
c = np.asarray(Image.open(src).convert('RGBA')).astype(np.float64) / 255
rgb, a = c[..., :3].copy(), c[..., 3].copy()

# manual retouch: dark curtain-rod fragments the matte kept above the hair
for (x0, x1, y_end) in [(476, 502, 97), (584, 622, 93)]:
    a[:y_end, x0:x1] = 0

# trim to subject bbox (+ small pad on top)
ys, xs = np.where(a > 0.01)
top = max(0, ys.min() - 16)
rgb, a = rgb[top:], a[top:]

def save(img_rgb, name):
    rgba = np.dstack([np.clip(img_rgb, 0, 1), a])
    Image.fromarray((rgba * 255 + 0.5).astype(np.uint8), 'RGBA').save(f'{out_dir}/{name}', optimize=True)

save(rgb, 'bilal-cutout.png')

# --- grade: work in linear light ---
lin = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
lin *= 2 ** -0.3                                    # exposure -0.3 EV
lin = lin / (1 + lin * 0.35)                        # soft highlight shoulder (sunlit skin)
lum = (lin @ np.array([0.2126, 0.7152, 0.0722]))[..., None]
lin = lum + (lin - lum) * 0.82                      # gentle desaturation
shadow = np.clip(1 - lum / 0.18, 0, 1)              # cool the shadows, keep skin mids warm
lin = lin * (1 + shadow * np.array([-0.06, 0.0, 0.10]))
lin = lin * np.array([0.97, 1.0, 1.04])             # overall cooler white balance
srgb = np.where(lin <= 0.0031308, lin * 12.92, 1.055 * np.clip(lin, 0, None) ** (1 / 2.4) - 0.055)
# mild S-curve for contrast
srgb = np.clip(srgb, 0, 1)
srgb = srgb + 0.10 * np.sin(2 * np.pi * srgb) * -0.5 * (srgb * (1 - srgb) > 0)
save(srgb, 'bilal-cutout-graded.png')

matte = Image.fromarray((a * 255 + 0.5).astype(np.uint8), 'L')
matte = matte.resize((384, round(384 * a.shape[0] / a.shape[1])), Image.LANCZOS)
white = Image.new('L', matte.size, 255)
Image.merge('LA', (white, matte)).save(f'{out_dir}/bilal-matte.png', optimize=True)
print('size', a.shape[1], 'x', a.shape[0], 'top trim', top)
