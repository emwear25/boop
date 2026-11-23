"""Cut every object out of a white-background sheet into its own transparent PNG.
    python3 tools/3d/cutout.py <sheet.jpg> <out_prefix> name1 name2 ...   (names in reading order)"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

src, prefix, names = sys.argv[1], sys.argv[2], sys.argv[3:]
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(int)
# background = near-white pixels connected to the border
white = (a.min(2) > 236) & ((a.max(2) - a.min(2)) < 14)
lab, _ = ndimage.label(white)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
fg = ndimage.binary_fill_holes(ndimage.binary_opening(~bg, iterations=2))
objs, n = ndimage.label(ndimage.binary_dilation(fg, iterations=6))
sizes = ndimage.sum(np.ones_like(objs), objs, range(1, n + 1))
keep = [i + 1 for i in np.argsort(sizes)[::-1][:len(names)]]
boxes = ndimage.find_objects(objs)
items = sorted(((boxes[k - 1], k) for k in keep), key=lambda b: (round(b[0][0].start / 300), b[0][1].start))
alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
for name, (sl, k) in zip(names, items):
    y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
    pad = 24
    box = (max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad))
    mask = np.asarray(alpha.crop(box)).copy()
    mask[(objs[box[1]:box[3], box[0]:box[2]] != k)] = 0
    out = im.crop(box).convert('RGBA')
    out.putalpha(Image.fromarray(mask))
    path = f'{prefix}-{name}.png'
    out.save(path)
    print(path, out.size)
