"""Refine a coarse segmentation mask into a clean alpha matte.

coarse ISNet alpha -> trimap (wider unknown band in hair rows) -> closed-form
matting -> keep only the subject's connected body -> ML foreground estimation
(removes background colour spill from hair edges).
"""
import sys, time
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from pymatting import estimate_alpha_cf, estimate_foreground_ml

img_path, mask_path, out_prefix = sys.argv[1:4]
HAIR_ROWS = int(sys.argv[4]) if len(sys.argv) > 4 else 480

img = np.asarray(Image.open(img_path).convert('RGB')).astype(np.float64) / 255
coarse = np.asarray(Image.open(mask_path).convert('L')).astype(np.float64) / 255
h, w = coarse.shape

fg = coarse > 0.95
bg = coarse < 0.05
# keep only the main body for definite foreground (drops stray streaks)
lab, n = ndi.label(coarse > 0.5)
sizes = ndi.sum(np.ones_like(coarse), lab, range(1, n + 1))
body = lab == (np.argmax(sizes) + 1)
fg &= body

def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r

rows = np.arange(h)[:, None] * np.ones((1, w))
band_hair, band_body = 14, 5
fg_hair = ndi.binary_erosion(fg, disk(band_hair))
fg_body = ndi.binary_erosion(fg, disk(band_body))
fg_t = np.where(rows < HAIR_ROWS, fg_hair, fg_body)
# opened core: thin window-frame / curtain lines (< ~10px wide) vanish here,
# so they can't seed the unknown band around the hair
core = ndi.binary_opening(body, disk(5))
reach = ndi.binary_dilation(core, disk(band_hair))
bg_t = np.where(rows < HAIR_ROWS, ~reach, ~ndi.binary_dilation(body, disk(band_body)) & bg)

trimap = np.full((h, w), 0.5)
trimap[fg_t] = 1.0
trimap[bg_t] = 0.0
Image.fromarray((trimap * 255).astype(np.uint8)).save(out_prefix + '-trimap.png')
print('unknown px:', int((trimap == 0.5).sum()))

t = time.time()
alpha = estimate_alpha_cf(img, trimap, laplacian_kwargs={'epsilon': 1e-6},
                          cg_kwargs={'maxiter': 2000})
print('cf matting', round(time.time() - t, 1), 's')
alpha = np.clip(alpha, 0, 1)

# drop anything not connected to the body (window-frame lines, curtain folds)
lab, n = ndi.label(alpha > 0.03)
keep_ids = np.unique(lab[body & (lab > 0)])
alpha *= np.isin(lab, keep_ids)
# kill thin faint structures far from the coarse subject
far = ~ndi.binary_dilation(core, disk(band_hair + 2))
alpha[far] = 0
alpha[alpha < 0.02] = 0
alpha[alpha > 0.98] = 1

t = time.time()
fgc = estimate_foreground_ml(img, alpha)
print('foreground', round(time.time() - t, 1), 's')

rgba = np.dstack([np.clip(fgc, 0, 1), alpha])
Image.fromarray((rgba * 255 + 0.5).astype(np.uint8), 'RGBA').save(out_prefix + '.png', optimize=True)
Image.fromarray((alpha * 255 + 0.5).astype(np.uint8)).save(out_prefix + '-alpha.png')
print('done')
