import os
#!/usr/bin/env python3
"""Assemble la page jouable à partir de src.html et des données.
Écrit ../index.html (GitHub Pages), seuil-prototype.html (publication) et t.html (tests)."""
import base64, os, json
d = os.path.dirname(os.path.abspath(__file__))
rd = lambda p, m='r': open(os.path.join(d, p), m, **({} if 'b' in m else {'encoding': 'utf-8'})).read()
b64 = lambda p: 'data:image/jpeg;base64,' + base64.b64encode(rd(p, 'rb')).decode()
s = rd('src.html')
th = rd('th/theatres.json')
for k in json.loads(th):
    if os.path.exists(os.path.join(d, f'th/{k}.jpg')): th = th.replace(f'__THIMG_{k}__', b64(f'th/{k}.jpg'))
R = [('__MILSYMBOL__', rd('milsymbol.js')),
     ('__MAPLIBRE__', rd('vendor/maplibre-gl.js').replace('</script', '<\\/script')),
     ('__THREE__', rd('vendor/three.min.js').replace('</script', '<\\/script')),
     ('__IMG__', b64('../maps/theatre.jpg')), ('__MASK__', rd('mask.rle')), ('__GEO__', rd('geo.json')),
     ('__TH__', th), ('__WORLD__', b64('th/world.jpg')), ('__DB__', rd('scenarios.json')),
     ('__VEC__', rd('th/vec.json')), ('__HICOAST__', rd('th/hicoast.json') if os.path.exists('th/hicoast.json') else 'null'), ('__SND__', rd('son-pack.json'))]
for k, v in R:
    assert s.count(k) == 1, k
for k, v in R:
    s = s.replace(k, v, 1)
open(os.path.join(d, 'seuil-prototype.html'), 'w', encoding='utf-8').write(s)
open(os.path.join(d, 't.html'), 'w', encoding='utf-8').write('<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">' + s)
open(os.path.join(d, '../index.html'), 'w', encoding='utf-8').write('<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">' + s)
print(len(s))

# contrôle : clés de traduction en double (la dernière écrase la première sans prévenir)
import re as _re, collections as _co
_s=open('src.html',encoding='utf-8').read();_i=_s.find('const I18N=');_j=_s.find('\nlet LANG');_b=_s[_i:_j];_f=_b.find('fr:{');_e=_b.find('en:{',_f)
for _n,_seg in (('fr',_b[_f:_e]),('en',_b[_e:])):
    _d=[k for k,v in _co.Counter(_re.findall(r"(?<=[{,\n])\s*'([a-zA-Z0-9_.!-]+)':",_seg)).items() if v>1]
    if _d: print('ATTENTION clés en double', _n, _d)
