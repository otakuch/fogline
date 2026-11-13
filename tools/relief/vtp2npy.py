#!/usr/bin/env python3
"""Convertit ETOPO_10min_Ice.vtp (pyvista/vtk-data) en grille etopo10.npy. Usage : vtp2npy.py <entrée.vtp> <sortie.npy>"""
import base64, re, struct, sys, zlib
import numpy as np
d = open(sys.argv[1], 'rb').read()
j = d.find(b'_', d.find(b'<AppendedData')) + 1
off = {m.group(1).decode(): int(m.group(2)) for m in re.finditer(rb'Name="(\w+)"[^>]*offset="(\d+)"', d[:j])}
def arr(o, dt):
    p = j + o
    nb = struct.unpack('<I', base64.b64decode(d[p:p + 16])[:4])[0]
    hl = ((3 + nb) * 4 + 2) // 3 * 4
    sizes = struct.unpack('<%dI' % nb, base64.b64decode(d[p:p + hl])[12:12 + 4 * nb])
    raw = base64.b64decode(d[p + hl:p + hl + (sum(sizes) + 2) // 3 * 4])
    out, q = [], 0
    for s in sizes:
        out.append(zlib.decompress(raw[q:q + s])); q += s
    return np.frombuffer(b''.join(out), dt)
alt, pts = arr(off['altitude'], '<f4'), arr(off['Points'], '<f4').reshape(-1, 3)
lon = np.degrees(np.arctan2(pts[:, 1], pts[:, 0]))
lat = np.degrees(np.arcsin(np.clip(pts[:, 2], -1, 1)))
G = np.full((1081, 2161), np.nan, 'f4')
G[np.round((90 - lat) * 6).astype(int), np.round((lon + 180) * 6).astype(int) % 2160] = alt
G[:, 2160] = G[:, 0]
assert not np.isnan(G).any()
np.save(sys.argv[2], G)
