#!/usr/bin/env python3
"""Fond de carte en relief par théâtre : montagnes et fonds marins.

Usage : python3 tools/relief/relief.py <etopo10.npy> [théâtre ...]
Entrée : grille mondiale d'altitude ETOPO à 10 minutes d'arc (NOAA, domaine public), 1081 x 2161,
latitude de 90 à -90, longitude de -180 à 180. Voir tools/relief/README.md pour l'obtenir.
Sortie : proto/th/relief_<théâtre>.png, grille de 400 x 250 altitudes dans le repère du jeu (projection de
proto/th/views.json). Le jeu en fait un maillage three.js ; terre et mer y sont séparées par les côtes du jeu.
"""
import json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
W, H = 1440, 900                           # repère du jeu
VIEWS = json.load(open(os.path.join(ROOT, 'proto/th/views.json')))

def sample(G, lon, lat):
    """Interpolation bilinéaire dans la grille à 10 minutes."""
    fx = ((lon + 180) % 360) * 6
    fy = np.clip((90 - lat) * 6, 0, G.shape[0] - 1.001)
    x0, y0 = np.floor(fx).astype(int), np.floor(fy).astype(int)
    ax, ay = fx - x0, fy - y0
    x0 %= 2160
    x1 = (x0 + 1) % 2160
    return (G[y0, x0] * (1 - ax) + G[y0, x1] * ax) * (1 - ay) + (G[y0 + 1, x0] * (1 - ax) + G[y0 + 1, x1] * ax) * ay

GW, GH = 400, 250                          # grille d'altitude embarquée dans la page

def heights(k, G):
    """Altitudes du théâtre sur une grille GW x GH couvrant le repère 1440 x 900 (sommets aux bords)."""
    v = VIEWS[k]
    lon0, lat0, s = np.radians(-v['rot'][0]), np.radians(-v['rot'][1]), v['s']
    X, Y = np.meshgrid((np.linspace(0, W, GW) - v['c'][0]) / s, -(np.linspace(0, H, GH) - v['c'][1]) / s)
    r = np.clip(np.hypot(X, Y), 1e-9, .9999)
    c = np.arcsin(r)
    lat = np.arcsin(np.cos(c) * np.sin(lat0) + Y * np.sin(c) * np.cos(lat0) / r)
    lon = lon0 + np.arctan2(X * np.sin(c), r * np.cos(c) * np.cos(lat0) - Y * np.sin(c) * np.sin(lat0))
    return sample(G, np.degrees(lon), np.degrees(lat))

if __name__ == '__main__':
    G = np.load(sys.argv[1])
    for k in (sys.argv[2:] or list(VIEWS)):
        e = np.clip(np.round(heights(k, G)) + 11000, 0, 65535).astype('u2')   # altitude + 11 000 m sur 16 bits : rouge = poids fort, vert = poids faible
        rgb = np.stack([(e >> 8).astype('u1'), (e & 255).astype('u1'), np.zeros(e.shape, 'u1')], -1)
        p = os.path.join(ROOT, f'proto/th/relief_{k}.png')
        Image.fromarray(rgb, 'RGB').save(p, optimize=True)
        print(k, os.path.getsize(p), int(e.min()) - 11000, int(e.max()) - 11000)
