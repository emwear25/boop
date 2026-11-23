"""Personalised kibble scoop "Плитка" (ЧАРЛИ) for the Bambu Lab P2S + AMS.

    python3 tools/3d/scoop.py --name ЧАРЛИ

Built from the reference views in design/scoop-charli/:
  - cup: rounded bowl with a flat base and a wide flat rim
  - strap: flat cream strap level with the rim, from the rim to the tip, name raised on top
  - twist: a two-colour candy twist (cream half + terracotta half with a groove between),
    1.75 turns, a little fatter towards the tip
  - tip: cream cap over the end of the twist

Writes tools/3d/out/scoop-<name in latin>-cream.stl and -terracotta.stl.
Print upright, 0.2 mm, tree supports under the handle (cream only).
"""
import argparse
import math
import pathlib
import tempfile

import numpy as np
import trimesh
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from matplotlib.font_manager import FontProperties
from matplotlib.textpath import TextPath
from shapely import affinity
from shapely.geometry import Polygon
from shapely.ops import unary_union

HERE = pathlib.Path(__file__).parent
OUT = HERE / 'out'

# Cup (mm)
R = 40.0            # outer radius
H = 50.0            # height
WALL = 2.4
FLOOR = 2.4
RI = R - WALL
F_OUT = 20.0        # outer bottom rounding (bowl shape)
F_IN = 14.0         # inner bottom rounding (easy to clean)
RIM_OUT = 2.0       # the flat rim sticks out this much
RIM_T = 3.0         # rim thickness
# Handle
TOP_Z = H           # strap top is level with the rim
X0 = R - 6.0        # handle starts inside the cup wall
X_END = R + 105.0   # tip
STRAP_W = 19.0
STRAP_T = 5.0
TW_R0, TW_R1 = 14.5, 17.5   # radius of the twist at the cup and at the tip
TW_TURNS = 1.75
GROOVE = 3.0        # depth of the groove between the two colours
CAP_L = 9.0         # cream cap over the end of the twist
NAME_RAISE = 0.8


def boolean(op, meshes):
    return getattr(trimesh.boolean, op)(meshes, engine='manifold')


def arc(cx, cy, r, a0, a1, n=32):
    return [(cx + r * math.cos(a), cy + r * math.sin(a)) for a in np.linspace(a0, a1, n)]


def revolve(pts):
    m = trimesh.creation.revolve(np.array(pts), sections=160)
    if m.volume < 0:
        m.invert()
    return m


def cup():
    """Bowl profile (radius, z): 45° foot (no steep overhang on the first layers), big
    rounded bottom, straight wall, flat rim that sticks out a little."""
    zc = F_OUT
    start = (R - F_OUT + F_OUT * math.cos(-math.pi / 4), zc + F_OUT * math.sin(-math.pi / 4))
    foot = (start[0] - start[1], 0.0)
    pts = [(0.0, 0.0), foot, start]
    pts += arc(R - F_OUT, zc, F_OUT, -math.pi / 4, 0)[1:]
    pts += [(R, H - RIM_T - RIM_OUT),          # 45° under the rim, prints without support
            (R + RIM_OUT, H - RIM_T),
            (R + RIM_OUT, H - 0.6)]
    pts += arc(R + RIM_OUT - 0.6, H - 0.6, 0.6, 0, math.pi / 2, 8)[1:]
    pts += [(RI + 0.6, H)]
    pts += arc(RI + 0.6, H - 0.6, 0.6, math.pi / 2, math.pi, 8)[1:]
    pts += [(RI, FLOOR + F_IN)]
    pts += arc(RI - F_IN, FLOOR + F_IN, F_IN, 0, -math.pi / 2)[1:]
    pts += [(0.0, FLOOR)]
    return revolve(pts)


def cavity(top=H + 5):
    pts = [(0.0, FLOOR), (RI - F_IN, FLOOR)]
    pts += arc(RI - F_IN, FLOOR + F_IN, F_IN, -math.pi / 2, 0)[1:]
    pts += [(RI, top), (0.0, top)]
    return revolve(pts)


def sweep(section, x_from, x_to, steps=300):
    """Loft closed 2D sections (y, z) along +x. section(s) returns an (n, 2) array, same n."""
    rings = [np.asarray(section(i / steps)) for i in range(steps + 1)]
    n = len(rings[0])
    verts = [(x_from + i / steps * (x_to - x_from), y, z) for i, r in enumerate(rings) for y, z in r]
    faces = []
    for i in range(steps):
        for j in range(n):
            a, b = i * n + j, i * n + (j + 1) % n
            faces += [[a, b, a + n], [b, b + n, a + n]]
    c0, c1 = len(verts), len(verts) + 1
    verts += [(x_from, *rings[0].mean(0)), (x_to, *rings[-1].mean(0))]
    last = steps * n
    for j in range(n):
        faces.append([c0, (j + 1) % n, j])
        faces.append([c1, last + j, last + (j + 1) % n])
    m = trimesh.Trimesh(np.array(verts), np.array(faces), process=True)
    trimesh.repair.fix_normals(m)
    return m


def tw_radius(s):
    return TW_R0 + (TW_R1 - TW_R0) * s


def tw_axis(s):
    """Twist axis height: the top of the twist stays 1.5 mm under the strap top."""
    return TOP_Z - 1.5 - tw_radius(s)


def twist_half(phase, grow=0.0):
    """One colour of the candy twist: half a disc with a groove at both seams."""
    def section(s):
        r = tw_radius(s) + grow
        zc = tw_axis(s)
        th = phase + s * TW_TURNS * 2 * math.pi
        g = GROOVE / r                        # angular half-width of the groove
        # each colour bulges like a rounded strand: full radius in its middle, lower at the seams
        pts = [(rr * math.cos(a), zc + rr * math.sin(a))
               for a in np.linspace(th + g, th + math.pi - g, 56)
               for rr in [r * (0.80 + 0.20 * math.sin(a - th) ** 0.6)]]
        n = (math.cos(th + math.pi / 2), math.sin(th + math.pi / 2))   # towards this half
        pts.append(((r - GROOVE) * math.cos(th + math.pi), zc + (r - GROOVE) * math.sin(th + math.pi)))
        pts.append((0.3 * n[0], zc + 0.3 * n[1]))
        pts.append(((r - GROOVE) * math.cos(th), zc + (r - GROOVE) * math.sin(th)))
        return pts
    return sweep(section, X0, X_END + 4)


def rounded_rect(w, t, r, z_top, n=10):
    pts = []
    corners = [(w / 2 - r, z_top - r, 0), (-w / 2 + r, z_top - r, math.pi / 2),
               (-w / 2 + r, z_top - t + r, math.pi), (w / 2 - r, z_top - t + r, 3 * math.pi / 2)]
    for cy, cz, a0 in corners:
        for a in np.linspace(a0, a0 + math.pi / 2, n):
            pts.append((cy + r * math.cos(a), cz + r * math.sin(a)))
    return pts


def strap():
    return sweep(lambda s: rounded_rect(STRAP_W, STRAP_T, 2.0, TOP_Z), X0, X_END + 4, steps=40)


def tip_shape():
    """Everything of the handle lies inside this: rounded at the end (ellipsoid), flat top."""
    ry = TW_R1 + 3
    z_lo = tw_axis(1) - TW_R1 - 3
    zc, rz = tw_axis(1), TW_R1 + 3
    L = TW_R1 + 2
    body = trimesh.creation.box(bounds=[[X0 - 40, -ry, z_lo - 40], [X_END - L, ry, TOP_Z + 1]])
    cap = trimesh.creation.icosphere(subdivisions=5, radius=1.0)
    cap.apply_scale([L, ry, max(rz, TOP_Z - zc + 0.5)])
    cap.apply_translation([X_END - L, 0, zc])
    top = trimesh.creation.box(bounds=[[X0 - 50, -50, z_lo - 50], [X_END + 10, 50, TOP_Z]])
    return boolean('intersection', [boolean('union', [body, cap]), top])


def bold_font():
    path = pathlib.Path(tempfile.gettempdir()) / 'boop-sf-rounded-bold.ttf'
    if not path.exists():
        f = TTFont('/System/Library/Fonts/SFCompactRounded.ttf')
        instancer.instantiateVariableFont(f, {'wght': 700}, inplace=True)
        f.save(path)
    return FontProperties(fname=str(path))


def name_mesh(name):
    """Raised name on the flat strap top."""
    tp = TextPath((0, 0), name.upper(), size=10, prop=bold_font())
    shape = Polygon()
    for r in sorted((Polygon(p) for p in tp.to_polygons() if len(p) > 2), key=lambda p: -abs(p.area)):
        shape = shape.symmetric_difference(r.buffer(0))
    shape = unary_union(shape)
    x_a, x_b = R + RIM_OUT + 5, R + 68
    minx, miny, maxx, maxy = shape.bounds
    k = min((x_b - x_a) / (maxx - minx), (STRAP_W - 7) / (maxy - miny))
    shape = affinity.scale(shape, k, k, origin=(0, 0))
    minx, miny, maxx, maxy = shape.bounds
    shape = affinity.translate(shape, (x_a + x_b) / 2 - (minx + maxx) / 2, -(miny + maxy) / 2)
    parts = list(shape.geoms) if hasattr(shape, 'geoms') else [shape]
    m = trimesh.util.concatenate([trimesh.creation.extrude_polygon(g, NAME_RAISE + 0.3) for g in parts])
    m.apply_translation([0, 0, TOP_Z - 0.3])
    return m


def build(name):
    end = tip_shape()
    cream_half = boolean('intersection', [twist_half(0.0), end])
    terra_half = boolean('intersection', [twist_half(math.pi), end])
    # cream cap over the end of the twist
    cap_zone = trimesh.creation.box(bounds=[[X_END - CAP_L, -50, -50], [X_END + 20, 50, TOP_Z + 5]])
    envelope = boolean('intersection', [boolean('union', [twist_half(0.0, 0.01), twist_half(math.pi, 0.01)]), end])
    cap = boolean('intersection', [envelope, cap_zone])
    cav = cavity()
    cream = boolean('union', [cup(), boolean('intersection', [strap(), end]), cream_half, cap, name_mesh(name)])
    cream = boolean('difference', [cream, cav])
    wall_mid = trimesh.creation.cylinder(radius=RI + WALL / 2, height=3 * H, sections=160)
    terra = boolean('difference', [terra_half, cream, wall_mid])
    return cream, terra


BG = dict(zip('абвгдежзийклмнопрстуфхцчшщъьюя', ['a', 'b', 'v', 'g', 'd', 'e', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'ts', 'ch', 'sh', 'sht', 'a', 'y', 'yu', 'ya']))


def translit(name):
    return ''.join(BG.get(c, c) for c in name.lower()).replace(' ', '-')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--name', default='ЧАРЛИ')
    args = ap.parse_args()
    OUT.mkdir(exist_ok=True)
    cream, terra = build(args.name)
    for label, m in (('cream', cream), ('terracotta', terra)):
        assert m.is_watertight, f'{label} not watertight'
    slug = translit(args.name)
    cream.export(OUT / f'scoop-{slug}-cream.stl')
    terra.export(OUT / f'scoop-{slug}-terracotta.stl')
    lo, hi = (cream + terra).bounds
    holds = cavity(top=H - 1).volume / 1000
    print(f'size {np.round(hi - lo, 1)} mm, cream {cream.volume / 1000:.1f} cm³, terracotta {terra.volume / 1000:.1f} cm³, cup holds ~{holds:.0f} ml')


if __name__ == '__main__':
    main()
