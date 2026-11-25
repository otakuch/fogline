#!/usr/bin/env python3
"""Illustrations des crises : dérivés WebP servis par le jeu, à partir des PNG d'origine.

Les PNG de assets/crises/ restent les sources (1672 x 941, jamais modifiés).
La fenêtre de crise charge assets/crises/web/<nom>-480.webp ou <nom>-960.webp.
Usage : python3 tools/crises/optimise.py     (Pillow avec prise en charge de WebP)
"""
import os, hashlib, json
from PIL import Image
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'crises')
out = os.path.join(root, 'web'); os.makedirs(out, exist_ok=True)
man = json.load(open(os.path.join(root, 'illustrations-crises.json'), encoding='utf-8'))
for a in man['assets']:
    f = os.path.join(root, a['file'])
    assert hashlib.sha256(open(f, 'rb').read()).hexdigest() == a['sha256'], 'PNG modifié : ' + a['file']
    im = Image.open(f).convert('RGB')
    assert im.size == (1672, 941), (a['file'], im.size)
    for w in (480, 960):
        dst = os.path.join(out, '%s-%d.webp' % (a['file'][:-4], w))
        im.resize((w, round(w * 941 / 1672)), Image.LANCZOS).save(dst, 'WEBP', quality=78, method=6)
        print('%-44s %7d octets' % (os.path.basename(dst), os.path.getsize(dst)))
