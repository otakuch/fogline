#!/usr/bin/env python3
"""Illustrations des missions : dérivés WebP servis par le jeu, à partir des PNG d'origine.

Les PNG de assets/missions/ restent les sources (1672 x 941, jamais modifiés).
Le jeu charge assets/missions/web/<nom>-640.webp sur les cartes et <nom>-1280.webp au briefing.
Usage : python3 tools/missions/optimise.py     (Pillow avec prise en charge de WebP)
"""
import glob, os, hashlib, json
from PIL import Image
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'missions')
out = os.path.join(root, 'web'); os.makedirs(out, exist_ok=True)
man = json.load(open(os.path.join(root, 'mission-illustrations.json'), encoding='utf-8'))
sha = {os.path.basename(m['image']): m['sha256'] for m in man['missions']}
for f in sorted(glob.glob(os.path.join(root, '*.png'))):
    name = os.path.basename(f)
    assert hashlib.sha256(open(f, 'rb').read()).hexdigest() == sha[name], 'PNG modifié : ' + name
    im = Image.open(f).convert('RGB')
    assert im.size == (1672, 941), (name, im.size)
    for w in (640, 1280):
        h = round(w * 941 / 1672)
        dst = os.path.join(out, '%s-%d.webp' % (name[:-4], w))
        im.resize((w, h), Image.LANCZOS).save(dst, 'WEBP', quality=80, method=6)
        print('%-44s %4d x %3d %7d octets' % (os.path.basename(dst), w, h, os.path.getsize(dst)))
